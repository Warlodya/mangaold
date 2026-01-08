import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: {
                manga: {
                    include: {
                        tags: { include: { tag: true } },
                    },
                },
            },
        });

        const favoriteMangaIds = favorites.map(f => f.mangaId);

        const tagIdSet = new Set();
        favorites.forEach(fav => {
            fav.manga.tags.forEach(t => tagIdSet.add(t.tagId));
        });

        const tagIds = Array.from(tagIdSet);

        if (tagIds.length === 0) {
            return new Response(JSON.stringify([]), { status: 200 });
        }

        const recommendedMangas = await prisma.manga.findMany({
            where: {
                tags: {
                    some: { tagId: { in: tagIds } },
                },
                id: { notIn: favoriteMangaIds },
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
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
                tags: { include: { tag: true } },
            },
        });

        const ratings = await prisma.review.groupBy({
            by: ['mangaId'],
            _avg: { rating: true },
            _count: { rating: true },
        });

        const formatted = recommendedMangas.map(m => {
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
                coverUrl,
                rating: {
                    score: score !== null ? Number(score.toFixed(1)) : null,
                    count,
                },
                tags: m.tags.map(mt => mt.tag.name),
            };
        });

        return new Response(JSON.stringify(formatted), { status: 200 });
    } catch (err) {
        console.error('[RECOMMENDATION_ERROR]', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
