// src/app/api/mangas/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    const { title, originalTitle, description, tags } = await req.json()

    if (!title.trim()) {
        return NextResponse.json({ error: 'Потрібен заголовок' }, { status: 400 })
    }

    try {
        const created = await prisma.manga.create({
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
                tags: {
                    include: { tag: true },
                },
            },
        })

        // Удобный формат: возвращаем просто массив имён тегов
        const result = {
            id: created.id,
            title: created.title,
            originalTitle: created.originalTitle,
            description: created.description,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            tags: created.tags.map((mt) => mt.tag.name),
        }

        return NextResponse.json(result, { status: 201 })
    } catch (err) {
        console.error('[POST /api/mangas]', err)
        return NextResponse.json({ error: 'Не вдалося створити манґу' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const mangas = await prisma.manga.findMany({
            orderBy: { createdAt: 'desc' },
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
        })

        // рейтинг
        const ratings = await prisma.review.groupBy({
            by: ['mangaId'],
            _avg: { rating: true },
            _count: { rating: true },
        })

        const result = mangas.map(manga => {
            const page = manga.volumes[0]?.pages[0]
            const coverUrl = page?.imageUrl
                ? `/manga_pages/${page.imageUrl}`
                : '/manga_placeholder.png'

            const ratingData = ratings.find(r => r.mangaId === manga.id)
            const score = ratingData?._avg?.rating ?? null
            const count = ratingData?._count?.rating ?? 0

            return {
                id: manga.id,
                title: manga.title,
                originalTitle: manga.originalTitle,
                volumes: manga.volumes,
                coverUrl,
                description: manga.description,
                rating: {
                    score: score !== null ? Number(score.toFixed(1)) : null,
                    count,
                },
                tags: manga.tags.map(mt => mt.tag.name),  // <- вот здесь отдаём простой массив строк
            }
        })

        return NextResponse.json(result)
    } catch (err) {
        console.error(err)
        return new NextResponse('Server error', { status: 500 })
    }
}