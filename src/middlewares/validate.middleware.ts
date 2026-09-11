import type { Request, Response, NextFunction } from 'express';
import { type ZodType } from 'zod';

export const validate = (schema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 校验请求体，校验通过后用解析后的安全数据覆盖 req.body
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            next(error); // 抛给全局错误中间件处理
        }
    };
};