import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);

export const authRouter = router;