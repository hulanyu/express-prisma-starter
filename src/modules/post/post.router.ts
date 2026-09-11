import { Router } from 'express';
import { PostController } from './post.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { CreatePostSchema } from './post.schema.js';

const router = Router();

router.get('/', PostController.list);
router.post('/', authMiddleware, validate(CreatePostSchema), PostController.create);

export const postRouter = router;