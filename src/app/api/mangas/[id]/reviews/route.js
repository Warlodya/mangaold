import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const reviews = await prisma.review.findMany({
            where: { mangaId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });
        return NextResponse.json(reviews);
    } catch (err) {
        console.error('Помилка отримання відгуків:', err);
        return new NextResponse('Помилка серверу', { status: 500 });
    }
}

export async function POST(req, { params }) {
    const { id: mangaId } = await params;
    const { rating, content } = await req.json();

    if (!rating || rating < 1 || rating > 10) {
        return NextResponse.json({ error: 'Оцінка повинна бути від 1 до 10' }, { status: 400 });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
        }

        await prisma.review.upsert({
            where: {
                userId_mangaId: {
                    userId: user.id,
                    mangaId,
                },
            },
            update: {
                rating,
                content,
            },
            create: {
                rating,
                content,
                mangaId,
                userId: user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[POST /mangas/:id/reviews]', err);
        return new NextResponse('Помилка серверу', { status: 500 });
    }
}
