import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const count = await prisma.manga.count();
    if (count === 0) {
        return NextResponse.redirect(new URL('/manga', request.url));
    }

    const skip = Math.floor(Math.random() * count);
    const randomManga = await prisma.manga.findFirst({
        skip,
        select: { id: true },
    });

    if (!randomManga) {
        return NextResponse.redirect(new URL('/manga', request.url));
    }

    const baseUrl = request.headers.get('host')

    return NextResponse.redirect(new URL(`http://${baseUrl}/manga/${randomManga.id}`));
}
