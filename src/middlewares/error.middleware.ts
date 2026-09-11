import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. 处理 Zod 校验失败错误
    if (err instanceof ZodError) {
        return res.status(400).json({
            code: 400,
            message: '参数校验未通过',
            errors: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // 2. 处理自定义业务错误
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            code: err.statusCode,
            message: err.message,
        });
    }

    // 3. 兜底未捕获的服务端系统异常
    console.error('[Unhandled Error]:', err);
    return res.status(500).json({
        code: 500,
        message: '服务器内部错误，请稍后重试',
    });
}