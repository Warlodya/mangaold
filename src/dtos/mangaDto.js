export function toMangaListDTO(manga, ratingData = null) {
    const page = manga.volumes?.[0]?.pages?.[0];
    const coverUrl = page?.imageUrl
        ? `/manga_pages/${page.imageUrl}`
        : '/manga_placeholder.png';

    const score = ratingData?._avg?.rating ?? null;
    const count = ratingData?._count?.rating ?? 0;

    return {
        id: manga.id,
        title: manga.title,
        originalTitle: manga.originalTitle,
        description: manga.description,
        coverUrl,
        rating: {
            score: score !== null ? Number(score.toFixed(1)) : null,
            count,
        },
        tags: manga.tags?.map(mt => mt.tag.name) || [],
        createdAt: manga.createdAt, // Можна додати, якщо треба
    };
}