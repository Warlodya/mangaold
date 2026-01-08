import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE(request, context) {
    const { pageId } = await context.params;

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
        return NextResponse.json({ error: 'Такої сторінки немає' }, { status: 404 });
    }

    try {
        const filepath = path.join(
            process.cwd(),
            'public',
            'manga_pages',
            path.basename(page.imageUrl)
        );
        await fs.unlink(filepath);
    } catch {
        
    }

    await prisma.page.delete({ where: { id: pageId } });

    return new NextResponse(null, { status: 204 });
}
