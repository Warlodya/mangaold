import { NextResponse } from 'next/server';
import { mangaService } from '@/services/mangaService';

export async function GET() {
    try {
        const result = await mangaService.getAllMangas();
        return NextResponse.json(result);
    } catch (err) {
        console.error('[GET /api/mangas] Error:', err);
        return new NextResponse('Server error', { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const result = await mangaService.createManga(body);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        console.error('[POST /api/mangas] Error:', err);
        return NextResponse.json({ error: err.message || 'Error creating manga' }, { status: 500 });
    }
}