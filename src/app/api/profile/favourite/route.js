import { getUserFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
    const user = await getUserFromRequest(req)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const favourites = await prisma.favorite.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                updatedAt: true, // коли юзер востаннє "дивився" цю мангу
                manga: {
                    select: {
                        id: true,
                        title: true,
                        originalTitle: true,
                        description: true,
                        updatedAt: true, // оновлення манги
                        volumes: {
                            orderBy: { id: 'asc' },
                            include: {
                                pages: {
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        })

        const formatted = await Promise.all(
            favourites.map(async ({ updatedAt: favUpdatedAt, manga }) => {
                const cover = manga.volumes[0]?.pages[0]?.imageUrl
                const coverUrl = cover
                    ? `/manga_pages/${cover}`
                    : `/manga_placeholder.png`

                const rating = await prisma.review.aggregate({
                    where: { mangaId: manga.id },
                    _avg: { rating: true },
                    _count: { rating: true },
                })

                return {
                    id: manga.id,
                    title: manga.title,
                    originalTitle: manga.originalTitle,
                    description: manga.description,
                    coverUrl,
                    hasUpdates: manga.updatedAt.getTime() > favUpdatedAt.getTime(), // 💡 нові зміни?
                    rating: {
                        score: rating._avg.rating
                            ? Number(rating._avg.rating.toFixed(1))
                            : null,
                        count: rating._count.rating,
                    },
                    volumes: manga.volumes.map((volume) => ({
                        id: volume.id,
                        pages: volume.pages.map((page) => ({
                            id: page.id,
                            imageUrl: page.imageUrl,
                        })),
                    })),
                }
            })
        )

        return NextResponse.json({ favourites: formatted })
    } catch (err) {
        console.error('[GET /api/profile/favourite]', err)
        return NextResponse.json(
            { error: 'Серверна помилка' },
            { status: 500 }
        )
    }
}
