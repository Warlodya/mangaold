import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
        return NextResponse.json({ message: 'Unauthorized: No cookies' }, { status: 401 });
    }

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [key, ...val] = cookie.trim().split('=');
            return [key, decodeURIComponent(val.join('='))];
        })
    );

    const token = cookies.token;
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized: No token in cookie' }, { status: 401 });
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { mangaId } = await req.json();

    if (!mangaId) {
        return NextResponse.json({ message: 'Missing mangaId' }, { status: 400 });
    }

    try {
        await prisma.viewHistory.upsert({
            where: {
                userId_mangaId: {
                    userId: payload.id,
                    mangaId,
                },
            },
            update: {
                viewedAt: new Date(),
            },
            create: {
                userId: payload.id,
                mangaId,
                viewedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating view history:', error);
        return NextResponse.json({ message: 'Error updating view history' }, { status: 500 });
    }
}

export async function GET(req) {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
        return NextResponse.json({ message: 'Unauthorized: No cookies' }, { status: 401 });
    }

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [key, ...val] = cookie.trim().split('=');
            return [key, decodeURIComponent(val.join('='))];
        })
    );

    const token = cookies.token;
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized: No token in cookie' }, { status: 401 });
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    try {
        // Получаем историю переглядів
        const history = await prisma.viewHistory.findMany({
            where: { userId: payload.id },
            orderBy: { viewedAt: 'desc' },
            include: {
                manga: {
                    include: {
                        volumes: {
                            orderBy: { id: 'asc' },
                            take: 1,
                            include: {
                                pages: {
                                    orderBy: { id: 'asc' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        // Получаем агрегированные рейтинги по mangaId
        const ratings = await prisma.review.groupBy({
            by: ['mangaId'],
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        });

        // Сопоставляем данные
        const result = history.map((entry) => {
            const manga = entry.manga;
            const page = manga.volumes[0]?.pages[0];
            const coverUrl = page?.imageUrl
                ? `/manga_pages/${page.imageUrl}`
                : '/manga_placeholder.png';

            const ratingData = ratings.find(r => r.mangaId === manga.id);
            const score = ratingData?._avg?.rating ?? null;
            const count = ratingData?._count?.rating ?? 0;

            return {
                id: manga.id,
                title: manga.title,
                originalTitle: manga.originalTitle,
                volumes: manga.volumes,
                coverUrl,
                rating: {
                    score: score ? Number(score.toFixed(1)) : null,
                    count,
                },
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching view history:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}