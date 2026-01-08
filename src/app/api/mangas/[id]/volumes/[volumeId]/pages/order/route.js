import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req, context) {
    const { volumeId } = await context.params;
    const { pages } = await req.json();

    await prisma.$transaction(
        pages.map(p =>
            prisma.page.update({
                where: { id: p.id },
                data: { order: p.order },
            })
        )
    );

    const updated = await prisma.page.findMany({
        where: { volumeId },
        orderBy: { order: 'asc' },
    });
    return NextResponse.json(updated);
}