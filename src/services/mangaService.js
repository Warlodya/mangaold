import prisma from '@/lib/prisma';

export const mangaService = {
  // --- Допоміжний метод для форматування (DRY) ---
  async _formatManga(mangas) {
    // 1. Отримуємо ID для збору рейтингів
    const mangaIds = mangas.map(m => m.id);

    // 2. Агрегуємо рейтинги одним запитом
    const ratings = await prisma.review.groupBy({
      by: ['mangaId'],
      where: { mangaId: { in: mangaIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 3. Формуємо красивий об'єкт для клієнта
    return mangas.map(m => {
      const page = m.volumes[0]?.pages[0];
      const coverUrl = page?.imageUrl
        ? `/manga_pages/${page.imageUrl}`
        : '/manga_placeholder.png';

      const ratingData = ratings.find(r => r.mangaId === m.id);
      
      return {
        id: m.id,
        title: m.title,
        originalTitle: m.originalTitle,
        description: m.description,
        volumes: m.volumes, // Можна фільтрувати зайве, якщо треба
        coverUrl,
        rating: {
          score: ratingData?._avg?.rating ? Number(ratingData._avg.rating.toFixed(1)) : null,
          count: ratingData?._count?.rating ?? 0,
        },
        tags: m.tags.map(mt => mt.tag.name),
      };
    });
  },

  // --- Основні бізнес-методи ---

  async getAllMangas() {
    const mangas = await prisma.manga.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        volumes: {
          orderBy: { id: 'asc' },
          take: 1,
          include: { pages: { orderBy: { order: 'asc' }, take: 1 } },
        },
        tags: { include: { tag: true } },
      },
    });
    return await this._formatManga(mangas);
  },

  async search(query) {
    if (!query) return { mangas: [], tags: [] };

    const mangas = await prisma.manga.findMany({
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
          include: { pages: { orderBy: { order: 'asc' }, take: 1 } },
        },
        tags: { include: { tag: true } },
      },
    });

    const formattedMangas = await this._formatManga(mangas);

    const tags = await prisma.tag.findMany({
      where: { name: { contains: query } },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return { mangas: formattedMangas, tags };
  },

  async createManga(data) {
    const { title, originalTitle, description, tags } = data;
    
    // Валідацію можна робити тут або в Zod
    if (!title) throw new Error("Title is required");

    const created = await prisma.manga.create({
      data: {
        title,
        originalTitle,
        description,
        tags: {
          create: (tags || []).map((name) => ({
            tag: {
              connectOrCreate: { where: { name }, create: { name } },
            },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
    
    return created;
  }
};