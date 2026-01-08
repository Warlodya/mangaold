// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    return NextResponse.json(users);
}

// Якщо буде тєма з створенням юзверя через адмінку
export async function POST(request) {
    const { name, email, role } = await request.json();
    const user = await prisma.user.create({
        data: { name, email, role }
    });
    return NextResponse.json(user, { status: 201 });
}
