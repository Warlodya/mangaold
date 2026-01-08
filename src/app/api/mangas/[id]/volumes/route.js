// src/app/api/mangas/[id]/volumes/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
    const { id } = await params;
    const volumes = await prisma.volume.findMany({
        where: { mangaId: id },
        orderBy: { number: 'asc' },
    });
    return NextResponse.json(volumes);
}

export async function POST(request, { params }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Немає айді манги' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Невірний JSON' }, { status: 400 });
    }

    const { number, language } = body;
    if (typeof number !== 'number' || typeof language !== 'string') {
        return NextResponse.json(
            { error: 'Поля "number" (number) і "language" (string) обовʼязкові' },
            { status: 400 }
        );
    }

    const mangaExists = await prisma.manga.findUnique({ where: { id } });
    if (!mangaExists) {
        return NextResponse.json(
            { error: `Манга з айді ${id} не знайдена` },
            { status: 404 }
        );
    }

    const exists = await prisma.volume.findFirst({
        where: { mangaId: id, number, language },
    });
    if (exists) {
        return NextResponse.json(
            { error: `Том ${number} із мовою "${language}" вже існує для манги ${id}` },
            { status: 400 }
        );
    }

    const volume = await prisma.volume.create({
        data: { mangaId: id, number, language },
    });

    await prisma.manga.update({
        where: { id },
        data: { updatedAt: new Date() },
    });

    return NextResponse.json(volume, { status: 201 });
}