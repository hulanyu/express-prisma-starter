import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({ code: 201, message: '注册成功', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            res.json({ code: 200, message: '登录成功', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.getProfile(req.user!.userId);
            res.json({ code: 200, data: result });
        } catch (error) {
            next(error);
        }
    }
}