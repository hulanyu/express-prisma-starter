import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router.js';
import { postRouter } from './modules/post/post.router.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// 根路由
app.get('/', (req, res) => {
    res.json({ message: '🎉 Express + Prisma 服务已成功启动！' });
});

// 路由挂载
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

// 全局 404 兜底
app.use((req, res) => {
    res.status(404).json({ code: 404, message: `路径 ${req.method} ${req.originalUrl} 不存在` });
});

// 核心：注册全局异常中间件（必须放在所有路由之后）
app.use(errorHandler);

export default app;