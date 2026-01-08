// app/api/collections/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { getUserFromRequest } from '@/lib/auth';

// Helper to format manga list as in /api/search
async function formatMangaList(mangas) {
    const ratings = await prisma.review.groupBy({
        by: ['mangaId'],
        _avg: { rating: true },
        _count: { rating: true },
        where: { mangaId: { in: mangas.map(m => m.id) } }
    });

    return mangas.map(m => {
        const vol = m.volumes[0];
        const page = vol?.pages[0];
        const coverUrl = page?.imageUrl ? `/manga_pages/${page.imageUrl}` : '/manga_placeholder.png';
        const rate = ratings.find(r => r.mangaId === m.id);
        const score = rate?._avg?.rating ?? null;
        const count = rate?._count?.rating ?? 0;

        return {
            id: m.id,
            title: m.title,
            originalTitle: m.originalTitle,
            volumes: m.volumes,
            coverUrl,
            rating: { score: score !== null ? Number(score.toFixed(1)) : null, count },
            tags: m.tags.map(mt => mt.tag.name),
        };
    });
}

// GET: список всех коллекций
export async function GET() {
    try {
        const cols = await prisma.collection.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                mangas: { include: { manga: { include: { volumes: { orderBy: { id: 'asc' }, take: 1, include: { pages: { orderBy: { order: 'asc' }, take: 1 } } }, tags: { include: { tag: true } } } } } }
            }
        });

        const collections = await Promise.all(cols.map(async c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            authorId: c.authorId,
            mangas: await formatMangaList(c.mangas.map(cm => cm.manga)),
        })));

        // возвращаем массив коллекций напрямую
        return NextResponse.json([...collections]);
    } catch (err) {
        console.error('[GET /api/collections]', err);
        return new NextResponse('Помилка сервера', { status: 500 });
    }
}

// POST: создать новую коллекцию
export async function POST(req) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });

        const { name, description, mangaIds } = await req.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Назва обовʼязкова' }, { status: 400 });
        }

        const exists = await prisma.collection.findUnique({ where: { name } });
        if (exists) {
            return NextResponse.json({ error: 'Колекція з такою назвою вже існує' }, { status: 400 });
        }

        const created = await prisma.collection.create({
            data: {
                name,
                description: description || null,
                authorId: user.id,
                mangas: {
                    create: Array.isArray(mangaIds)
                        ? mangaIds.map(id => ({ manga: { connect: { id } } }))
                        : []
                }
            },
            include: {
                mangas: {
                    include: {
                        manga: {
                            include: {
                                volumes: {
                                    orderBy: { id: 'asc' },
                                    take: 1,
                                    include: { pages: { orderBy: { order: 'asc' }, take: 1 } }
                                },
                                tags: { include: { tag: true } }
                            }
                        }
                    }
                }
            }
        });

        const collection = {
            id: created.id,
            name: created.name,
            description: created.description,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            mangas: await formatMangaList(created.mangas.map(cm => cm.manga)),
        };

        return NextResponse.json(collection, { status: 201 });
    } catch (err) {
        console.error('[POST /api/collections]', err);
        return new NextResponse('Помилка сервера', { status: 500 });
    }
}
