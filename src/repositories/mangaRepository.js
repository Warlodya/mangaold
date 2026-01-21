import prisma from '@/lib/prisma';

export const mangaRepository = {
    async findAll() {
        return await prisma.manga.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                volumes: {
                    orderBy: { id: 'asc' },
                    take: 1,
                    include: {
                        pages: { orderBy: { order: 'asc' }, take: 1 },
                    },
                },
                tags: { include: { tag: true } },
            },
        });
    },

    async findByQuery(query) {
        return await prisma.manga.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { originalTitle: { contains: query } },
                    { tags: { some: { tag: { name: { contains: query } } } } }
                ]
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                volumes: {
                    orderBy: { id: 'asc' },
                    take: 1,
                    include: {
                        pages: { orderBy: { order: 'asc' }, take: 1 },
                    },
                },
                tags: { include: { tag: true } },
            },
        });
    },

    async getRatings(mangaIds) {
        return await prisma.review.groupBy({
            by: ['mangaId'],
            where: { mangaId: { in: mangaIds } },
            _avg: { rating: true },
            _count: { rating: true },
        });
    },

    async create(data) {
        const { title, originalTitle, description, tags } = data;
        return await prisma.manga.create({
            data: {
                title,
                originalTitle,
                description,
                tags: {
                    create: (tags || []).map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name },
                                create: { name },
                            },
                        },
                    })),
                },
            },
            include: {
                tags: { include: { tag: true } },
            },
        });
    },
    
    // Додатково: отримання тегів для пошуку
    async findTags(query) {
         return await prisma.tag.findMany({
            where: { name: { contains: query } },
            take: 20,
            orderBy: { name: 'asc' },
        });
    }
};