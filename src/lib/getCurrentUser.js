// src/lib/getCurrentUser.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getCurrentUser() {
    const cookie = await cookies()
    const token = cookie.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, avatar: true, role: true, email: true },
        });
        return user;
    } catch (e) {
        return null;
    }
}
