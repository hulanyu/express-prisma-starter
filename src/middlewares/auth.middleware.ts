import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/app-error.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-2026';

export interface AuthUserPayload {
    userId: number;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthUserPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const match = authHeader && authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!token) {
        throw new AppError('未登录或未提供有效凭证', 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        throw new AppError('Token 无效或已过期，请重新登录', 403);
    }
}