// src/app/api/mangas/[id]/volumes/[volumeId]/comments/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req, { params }) {
    const { id: mangaId, volumeId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content, parentId } = await req.json();
    if (!content?.trim()) {
        return new NextResponse('Content is required', { status: 400 });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                // зв'язок із томом
                volume: { connect: { id: volumeId } },
                // зв'язок із манґою (якщо потрібно)
                manga: { connect: { id: mangaId } },
                // зв'язок з батьківським коментарем (якщо відповідь)
                ...(parentId && { parent: { connect: { id: parentId } } }),
                // зв'язок із користувачем-автором
                user: { connect: { id: user.id } },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('[POST /api/mangas/:id/volumes/:volumeId/comments]', error);
        return new NextResponse('Server error', { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await req.json(); // тут чекаємо { id: commentId }
    if (!id) {
        return new NextResponse('Comment id is required', { status: 400 });
    }

    try {
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment || comment.userId !== user.id) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // видаляємо всі відповіді
        await prisma.comment.deleteMany({ where: { parentId: id } });
        // і сам коментар
        await prisma.comment.delete({ where: { id } });

        return new NextResponse('Deleted', { status: 200 });
    } catch (error) {
        console.error('[DELETE /api/mangas/:id/volumes/:volumeId/comments]', error);
        return new NextResponse('Server error', { status: 500 });
    }
}

export async function GET(req, { params }) {
    const { volumeId } = await params;
    try {
        const comments = await prisma.comment.findMany({
            where: { volumeId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,   // підтягуємо автора
            },
        });

        // Форматуємо вихід: додаємо authorName і прибираємо user обʼєкт
        const result = comments.map(c => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            parentId: c.parentId,
            authorName: c.user.name,
            // далі, якщо треба, додавайте інші поля
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('[GET /api/mangas/:id/volumes/:volumeId/comments]', error);
        return new NextResponse('Server error', { status: 500 });
    }
}