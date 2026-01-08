// app/api/collections/[id]/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// повторно используем форматтер
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
        const coverUrl = page?.imageUrl
            ? `/manga_pages/${page.imageUrl}`
            : '/manga_placeholder.png';

        const rate = ratings.find(r => r.mangaId === m.id);
        const score = rate?._avg?.rating ?? null;
        const count = rate?._count?.rating ?? 0;

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
}

export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const col = await prisma.collection.findUnique({
            where: { id },
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

        if (!col) return new NextResponse('Not Found', { status: 404 });

        const payload = {
            id: col.id,
            name: col.name,
            description: col.description,
            createdAt: col.createdAt,
            updatedAt: col.updatedAt,
            mangas: await formatMangaList(col.mangas.map(cm => cm.manga))
        };

        return NextResponse.json(payload);
    } catch (err) {
        console.error('[GET /api/collections/[id]]', err);
        return new NextResponse('Помилка сервера', { status: 500 });
    }
}

import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
    const { id } = await params;
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });

        const col = await prisma.collection.findUnique({ where: { id } });
        if (!col) return new NextResponse('Not Found', { status: 404 });

        if (col.authorId !== user.id && !isAdmin(user)) {
            return new NextResponse('Заборонено', { status: 403 });
        }

        const { name, description, mangaIds } = await req.json();
        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Назва обовʼязкова' }, { status: 400 });
        }

        const upd = await prisma.collection.update({
            where: { id },
            data: {
                name,
                description: description || null,
                mangas: {
                    deleteMany: {},
                    create: Array.isArray(mangaIds)
                        ? mangaIds.map(mangaId => ({ manga: { connect: { id: mangaId } } }))
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

        const payload = {
            id: upd.id,
            name: upd.name,
            description: upd.description,
            createdAt: upd.createdAt,
            updatedAt: upd.updatedAt,
            mangas: await formatMangaList(upd.mangas.map(cm => cm.manga))
        };

        return NextResponse.json(payload);
    } catch (err) {
        console.error('[PUT /api/collections/[id]]', err);
        return new NextResponse('Помилка сервера', { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const user = await getUserFromRequest(req);
        if (!user) return new NextResponse('Неавторизовано', { status: 401 });

        const col = await prisma.collection.findUnique({ where: { id } });
        if (!col) return new NextResponse('Not Found', { status: 404 });

        if (col.authorId !== user.id && !isAdmin(user)) {
            return new NextResponse('Заборонено', { status: 403 });
        }

        await prisma.collection.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error('[DELETE /api/collections/[id]]', err);
        return new NextResponse('Помилка сервера', { status: 500 });
    }
}