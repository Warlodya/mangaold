// src/app/api/mangas/[mangaId]/volumes/[volumeId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import fs from 'fs';
import path from 'path';

export async function DELETE(req, { params }) {
    const { volumeId } = params;

    try {
        // Знаходимо всі сторінки цього тому
        const pages = await prisma.page.findMany({
            where: { volumeId },
            select: { imageUrl: true }
        });

        // Видаляємо файли з диска
        await Promise.all(
            pages.map(async ({ imageUrl }) => {
                const filePath = path.join(process.cwd(), 'public', 'manga_pages', imageUrl);
                try {
                    fs.unlinkSync(filePath);
                } catch {
                    console.warn(`Не вдалося знайти або видалити файл: ${filePath}`);
                }
            })
        );

        // Видаляємо том (каскадно видаляються сторінки та коментарі)
        await prisma.volume.delete({
            where: { id: volumeId }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error('Помилка видалення тому:', err);
        return NextResponse.json({ error: 'Не вдалося видалити том' }, { status: 500 });
    }
}
