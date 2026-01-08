// app/api/search/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
        return NextResponse.json({ mangas: [], tags: [] });
    }

    try {
        const mangas = await prisma.manga.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { originalTitle: { contains: query } },
                    {
                        tags: {
                            some: {
                                tag: {
                                    name: { contains: query }
                                }
                            }
                        }
                    }
                ]
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                volumes: {
                    orderBy: { id: 'asc' },
                    take: 1,
                    include: {
                        pages: {
                            orderBy: { order: 'asc' },
                            take: 1,
                        },
                    },
                },
                tags: {
                    include: { tag: true }
                },
            },
        });

        // 2) Собираем рейтинги
        const ratings = await prisma.review.groupBy({
            by: ['mangaId'],
            _avg: { rating: true },
            _count: { rating: true },
        });

        // 3) Форматируем результат
        const mangaResults = mangas.map(m => {
            const page = m.volumes[0]?.pages[0];
            const coverUrl = page?.imageUrl
                ? `/manga_pages/${page.imageUrl}`
                : '/manga_placeholder.png';

            const ratingData = ratings.find(r => r.mangaId === m.id);
            const score = ratingData?._avg?.rating ?? null;
            const count = ratingData?._count?.rating ?? 0;

            return {
                id: m.id,
                title: m.title,
                originalTitle: m.originalTitle,
                volumes: m.volumes,
                coverUrl,
                rating: {
                    score: score !== null ? Number(score.toFixed(1)) : null,
                    count,
                },
                tags: m.tags.map(mt => mt.tag.name),
            };
        });

        // 4) Отдельно возвращаем подходящие теги
        const tags = await prisma.tag.findMany({
            where: { name: { contains: query } },
            take: 20,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ mangas: mangaResults, tags });
    } catch (error) {
        console.error('[GET /api/search] Error:', error);
        return new NextResponse('Помилка серверу', { status: 500 });
    }
}
