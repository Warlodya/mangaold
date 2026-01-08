// src/app/api/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req) {
    const { name, email, password } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: 'Ця пошта використовується' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            role: 'USER',
        },
    });

    const token = signToken(user);
    const res = NextResponse.json({ message: 'Користувач зареєстрований' });
    res.cookies.set('token', token, { httpOnly: true });

    return res;
}
