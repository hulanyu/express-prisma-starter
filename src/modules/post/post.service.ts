import { prisma } from '../../config/db.js';
import type { CreatePostInput } from './post.schema.js';

export class PostService {
    static async createPost(input: CreatePostInput, authorId: number) {
        return prisma.post.create({
            data: {
                title: input.title,
                content: input.content || '',
                published: input.published,
                authorId,
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    static async getAllPosts() {
        return prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}