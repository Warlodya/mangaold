// src/app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Ви вийшли' });

    response.cookies.set('token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
    });

    return response;
}
