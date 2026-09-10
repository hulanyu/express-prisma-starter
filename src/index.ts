import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
import { authMiddleware, JWT_SECRET, type AuthenticatedRequest } from './middlewares/auth.js';

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('🎉 Express + Prisma 服务已成功启动！请访问 /api/posts 查看接口。');
});

// ==========================================
// 1. 认证模块（Auth Routes）
// ==========================================

// 注册
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ code: 400, message: '邮箱和密码为必填项' });
        }

        // 检查邮箱是否已被注册
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ code: 400, message: '该邮箱已被注册' });
        }

        // 核心安全点：密码加盐哈希（10 轮计算复杂度）
        const hashedPassword = await bcrypt.hash(password, 10);

        // 存入数据库
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
            },
            // 核心安全点：通过 select 排除 password 字段，防止密码哈希泄漏给客户端
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        res.status(201).json({ code: 201, message: '注册成功', data: user });
    } catch (error) {
        res.status(500).json({ code: 500, message: '注册失败', error });
    }
});

// 登录
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ code: 400, message: '邮箱与密码不能为空' });
        }

        // 查询该用户
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
        }

        // 校验密码哈希是否匹配
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
        }

        // 签发 JWT Token（有效期设为 7 天）
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                user: { id: user.id, email: user.email, name: user.name },
            },
        });
    } catch (error) {
        res.status(500).json({ code: 500, message: '登录处理失败', error });
    }
});

// 获取个人资料（需要经过 authMiddleware 鉴权守卫）
app.get('/api/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        // req.user 由 authMiddleware 解析注入
        const userId = req.user!.userId;

        // 获取当前用户，同时联表查出其发布的所有文章
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                posts: true, // 一并把名下文章捞出来
            },
        });

        res.json({ code: 200, data: userProfile });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取个人信息失败' });
    }
});

// ==========================================
// 2. 文章模块（加入身份关联）
// ==========================================

// 创建文章：自动绑定到当前登录作者
app.post('/api/posts', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, content, published } = req.body;
        const authorId = req.user!.userId; // 从 Token 中提取的当前用户 ID

        if (!title) {
            return res.status(400).json({ code: 400, message: '文章标题不能为空' });
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content: content || '',
                published: Boolean(published),
                authorId, // 关联作者
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true }, // 返回作者概要信息
                },
            },
        });

        res.status(201).json({ code: 201, data: newPost });
    } catch (error) {
        res.status(500).json({ code: 500, message: '发布文章失败' });
    }
});

// 2. 获取单篇文章详情
app.get('/api/posts/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
        });

        if (!post) {
            return res.status(404).json({ code: 404, message: '文章不存在' });
        }

        res.json({ code: 200, data: post });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取文章详情失败' });
    }
});

// 公开接口：获取所有文章列表（含作者信息）
app.get('/api/posts', async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ code: 200, data: posts });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取文章列表失败' });
    }
});

// 4. 更新文章
app.put('/api/posts/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, published } = req.body;

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(published !== undefined && { published: Boolean(published) }),
            },
        });

        res.json({ code: 200, data: updatedPost });
    } catch (error) {
        res.status(500).json({ code: 500, message: '更新文章失败' });
    }
});

// 5. 删除文章
app.delete('/api/posts/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.post.delete({
            where: { id: Number(id) },
        });

        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: 500, message: '删除文章失败' });
    }
});

// 启动服务
app.listen(PORT, () => {
    console.log(`🚀 服务已启动：http://localhost:${PORT}`);
});