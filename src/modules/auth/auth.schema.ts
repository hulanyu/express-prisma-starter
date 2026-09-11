import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email({ message: '请输入合法的邮箱地址' }),
    password: z.string().min(6, { message: '密码长度不能少于 6 位' }),
    name: z.string().min(2, { message: '昵称至少 2 个字符' }).optional(),
});

export const LoginSchema = z.object({
    email: z.string().email({ message: '请输入合法的邮箱地址' }),
    password: z.string().min(1, { message: '密码不能为空' }),
});

// 自动推导出的 TypeScript 类型
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;