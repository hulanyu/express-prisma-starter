import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './db.js';

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('🎉 Express + Prisma 服务已成功启动！请访问 /api/posts 查看接口。');
});

// 1. 获取所有文章列表 (支持 query 筛选)
app.get('/api/posts', async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' }, // 按创建时间倒序
        });
        res.json({ code: 200, data: posts });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取文章列表失败', error });
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

// 3. 创建文章
app.post('/api/posts', async (req: Request, res: Response) => {
    try {
        const { title, content, published } = req.body;

        if (!title || typeof title !== 'string') {
            return res.status(400).json({ code: 400, message: '标题 (title) 为必填项' });
        }

        // 调用 Prisma 插入数据，享有完整的代码自动补全！
        const newPost = await prisma.post.create({
            data: {
                title,
                content: content || '',
                published: Boolean(published),
            },
        });

        res.status(201).json({ code: 201, data: newPost });
    } catch (error) {
        res.status(500).json({ code: 500, message: '创建文章失败' });
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