// src/app/api/mangas/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export async function PUT(req, { params }) {
    const { id } = await params;
    const { title, originalTitle, description, tags } = await req.json();

    if (!title.trim()) {
        return NextResponse.json({ error: 'Потрібен заголовок' }, { status: 400 });
    }

    try {
        const updated = await prisma.manga.update({
            where: { id },
            data: {
                title,
                originalTitle,
                description,
                tags: {
                    // 1) Видаляємо всі поточні зв'язки
                    deleteMany: {},
                    // 2) Створюємо нові зв'язки MangaTag
                    create: (tags || []).map(name => ({
                        tag: {
                            // Це вже операція над моделлю Tag
                            connectOrCreate: {
                                where: { name },        // шукаємо унікальний тег
                                create: { name },       // або створюємо новий
                            },
                        },
                    })),
                },
            },
            include: {
                // Повертаємо оновлену манґу з новим переліком тегів
                tags: {
                    include: {
                        tag: true,  // щоб в масиві tags було поле 'tag' з об'єктом Tag
                    },
                },
            },
        });

        // Для фронту зручно повернути просто масив рядків імен тегів
        const result = {
            ...updated,
            tags: updated.tags.map(mt => mt.tag.name),
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error('[PUT /api/mangas/:id]', err);
        return NextResponse.json({ error: 'Не вдалося оновити манґу' }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        // Парсим query-параметр lang
        const url = new URL(req.url);
        const langFilter = url.searchParams.get('lang');

        // Получаем мангу с томами и страницами
        const manga = await prisma.manga.findUnique({
            where: { id },
            include: {
                volumes: {
                    orderBy: { number: 'asc' },
                    include: {
                        pages: {
                            orderBy: { order: 'asc' }
                        },
                    },
                }
            },
        });

        if (!manga) {
            return new NextResponse('Манга не знайдена', { status: 404 });
        }

        // Подставляем обложку — первая страница первого тома
        const cover = manga.volumes[0]?.pages[0]?.imageUrl;
        const coverUrl = cover ? `/manga_pages/${cover}` : `/manga_placeholder.png`;

        // Получаем рейтинг этой манги
        const rating = await prisma.review.aggregate({
            where: { mangaId: id },
            _avg: { rating: true },
            _count: { rating: true },
        });

        const score = rating._avg.rating;
        const count = rating._count.rating;

        const tags = await prisma.mangaTag.findMany({
            where: { mangaId: id },
            include: {
                tag: true
            }
        });

        // Фильтруем тома по языку, если lang задан
        const filteredVolumes = langFilter
            ? manga.volumes.filter(v => v.language === langFilter)
            : manga.volumes;

        await prisma.favorite.updateMany({
            where: { mangaId: id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({
            id: manga.id,
            title: manga.title,
            originalTitle: manga.originalTitle,
            description: manga.description,
            coverUrl,
            rating: {
                score: score ? Number(score.toFixed(1)) : null,
                count,
            },
            volumes: filteredVolumes.map(volume => ({
                id: volume.id,
                lang: volume.language,
                number: volume.number,
                pages: volume.pages.map(page => ({
                    id: page.id,
                    imageUrl: page.imageUrl,
                })),
            })),
            tags: tags.map(t => t.tag.name),
        });
    } catch (err) {
        console.error('[GET /api/manga/:id]', err);
        return new NextResponse('Помилка серверу', { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    const { id } = await params;

    try {
        // Знаходимо всі сторінки, прив’язані до манґи
        const volumes = await prisma.volume.findMany({
            where: { mangaId: id },
            select: {
                pages: {
                    select: { imageUrl: true }
                }
            }
        });

        // Збираємо всі imageUrl для видалення файлів
        const imagePaths = volumes.flatMap(volume =>
            volume.pages.map(p => p.imageUrl)
        );

        // Видаляємо файли (якщо вони зберігаються локально)
        await Promise.all(imagePaths.map(async (url) => {
            const filePath = path.join(process.cwd(), 'public', 'manga_pages', url); // залежно від шляху
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.warn(`Файл не знайдено або не видалено: ${filePath}`);
            }
        }));

        // Видаляємо саму манґу (каскадно підуть і тому, і сторінки)
        await prisma.manga.delete({ where: { id } });

        return new Response(null, { status: 204 });
    } catch (err) {
        console.error('Помилка видалення манги:', err);
        return Response.json({ error: 'Не вдалося видалити мангу' }, { status: 500 });
    }
}