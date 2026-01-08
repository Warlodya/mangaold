// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: 'Field "file" is required' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'manga_pages');
    await fs.mkdir(uploadDir, { recursive: true });

    const originalName = file.name;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const hash = crypto
        .createHash('md5')
        .update(nameWithoutExt)
        .digest('hex')
        .slice(0, 8);

    const timestamp = Date.now();
    const filename = `${timestamp}-${hash}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ filename }, { status: 201 });
}
