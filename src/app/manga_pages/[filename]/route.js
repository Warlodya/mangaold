// src/app/api/image/[filename]/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
    const { filename } = await params;

    const filePath = path.join(process.cwd(), 'manga_pages', filename);
    try {
        const file = await fs.readFile(filePath);
        const type = mime.getType(filePath) || 'application/octet-stream';

        return new NextResponse(file, {
            headers: {
                'Content-Type': type,
            },
        });
    } catch (err) {
        console.log(err)
        return new NextResponse('Not found', { status: 404 });
    }
}
