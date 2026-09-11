import { z } from 'zod';

export const CreatePostSchema = z.object({
    title: z.string().min(1, { message: '标题不能为空' }).max(100, { message: '标题不能超过 100 字' }),
    content: z.string().optional(),
    published: z.boolean().optional().default(false),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;