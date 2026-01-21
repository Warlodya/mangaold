import { mangaRepository } from '@/repositories/mangaRepository';
import { toMangaListDTO } from '@/dtos/mangaDto';

export const mangaService = {
  // Внутрішній метод для об'єднання даних
  async _enrichWithRatings(mangas) {
    const mangaIds = mangas.map(m => m.id);
    const ratings = await mangaRepository.getRatings(mangaIds);

    return mangas.map(manga => {
      const ratingData = ratings.find(r => r.mangaId === manga.id);
      return toMangaListDTO(manga, ratingData);
    });
  },

  async getAllMangas() {
    const mangas = await mangaRepository.findAll();
    return await this._enrichWithRatings(mangas);
  },

  async search(query) {
    if (!query) return { mangas: [], tags: [] };

    // Паралельний запуск запитів для швидкості
    const [mangas, tags] = await Promise.all([
        mangaRepository.findByQuery(query),
        mangaRepository.findTags(query)
    ]);

    const formattedMangas = await this._enrichWithRatings(mangas);

    return { mangas: formattedMangas, tags };
  },

  async createManga(data) {
    const createdManga = await mangaRepository.create(data);
    // Для створеної манги рейтингу ще немає
    return toMangaListDTO(createdManga, null);
  }
};