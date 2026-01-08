'use client';

import { useEffect, useState } from 'react';
import MangaCard from './MangaCard';

export default function MangaList() {
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchManga = async () => {
            try {
                const res = await fetch('/api/mangas',
                    { method: 'GET' }
                );
                if (!res.ok) {
                    throw new Error('Помилка завантаження манги');
                }
                const data = await res.json();
                setMangaList(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchManga();
    }, []);

    if (loading) return <div className="mt-6">Завантаження манги...</div>;
    if (error) return <div className="mt-6 text-red-500">Помилка: {error}</div>;

    return (
        <div className="flex align-middle justify-center flex-wrap gap-6">
            {mangaList.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
            ))}
        </div>
    );
}
