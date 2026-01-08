import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, context) {
    const { volumeId } = await context.params;
    const pages = await prisma.page.findMany({
        where: { volumeId },
        orderBy: { order: 'asc' },
    });
    return NextResponse.json(pages);
}

export async function POST(req, { params }) {
    const { volumeId } = await params;
    const { imageUrl } = await req.json();
    const maxOrder = await prisma.page.aggregate({
        where: { volumeId },
        _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const page = await prisma.page.create({
        data: { volumeId, imageUrl, order: nextOrder },
    });
    return NextResponse.json(page, { status: 201 });
}
