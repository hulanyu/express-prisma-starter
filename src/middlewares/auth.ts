import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 生产环境务必从 process.env.JWT_SECRET 获取
export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-2026';

// 1. 定义 JWT Payload 结构
export interface AuthUserPayload extends jwt.JwtPayload {
    userId: number;
    email: string;
}

// 2. 扩展 Express 的 Request 接口类型
export interface AuthenticatedRequest extends Request {
    user?: AuthUserPayload;
}

// 3. 鉴权中间件
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // 使用正则匹配：不区分大小写，且兼容 Bearer 和 token 之间有多个空格的情况
    const match = authHeader && authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!token) {
        return res.status(401).json({
            code: 401,
            message: '未登录或未提供有效认证凭证',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            code: 403,
            message: 'Token 无效或已过期，请重新登录',
        });
    }
}