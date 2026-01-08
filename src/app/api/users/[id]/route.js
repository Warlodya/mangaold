// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    const { id } = await params;
    const { role } = await request.json();
    if (!['USER', 'AUTHOR', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const updated = await prisma.user.update({
        where: { id },
        data: { role },
    });
    return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
}
