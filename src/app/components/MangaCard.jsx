'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MangaCard({ id, title, originalTitle, coverUrl, rating, hasUpdates = false }) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/manga/${id}`)}
            className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg h-80 w-56 group"
        >
            <Image
                src={coverUrl || '/placeholder.jpg'}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-gray-300">{originalTitle}</p>
                <div className="text-sm text-yellow-300">{Array(rating.score).fill(null).map((_, i) => (
                    <span key={i}>✦</span>
                ))}</div>
            </div>
            {hasUpdates && <div className="absolute rounded-full top-1.5 right-1.5 bg-red-500 px-2 py-1 text-white">ОНОВЛЕНО</div>}
        </div>
    );
}
