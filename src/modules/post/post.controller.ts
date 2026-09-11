import type { Request, Response, NextFunction } from 'express';
import { PostService } from './post.service.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class PostController {
    static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const result = await PostService.createPost(req.body, req.user!.userId);
            res.status(201).json({ code: 201, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await PostService.getAllPosts();
            res.json({ code: 200, data: result });
        } catch (error) {
            next(error);
        }
    }
}