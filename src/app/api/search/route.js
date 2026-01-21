import { NextResponse } from 'next/server';
import { mangaService } from '@/services/mangaService';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    try {
        const result = await mangaService.search(query);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[GET /api/search] Error:', error);
        return new NextResponse('Помилка серверу', { status: 500 });
    }
}