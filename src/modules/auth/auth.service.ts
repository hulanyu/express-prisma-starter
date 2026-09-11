import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { AppError } from '../../errors/app-error.js';
import { JWT_SECRET } from '../../middlewares/auth.middleware.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

export class AuthService {
    static async register(input: RegisterInput) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new AppError('该邮箱已被注册', 400);
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await prisma.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return user;
    }

    static async login(input: LoginInput) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user) {
            throw new AppError('邮箱或密码错误', 401);
        }

        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) {
            throw new AppError('邮箱或密码错误', 401);
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: { id: user.id, email: user.email, name: user.name },
        };
    }

    static async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                posts: true,
            },
        });

        if (!user) {
            throw new AppError('用户不存在', 404);
        }

        return user;
    }
}