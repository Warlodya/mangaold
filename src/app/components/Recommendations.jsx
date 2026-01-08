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
                const res = await fetch('/api/recomendataions', {
                    method: 'GET',
                    credentials: 'include'
                });
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

    if (loading) return <div className="mt-6">Завантаження рекомендованої манги...</div>;
    if (error) return <div className="mt-6 text-red-500">Помилка: {error}</div>;

    return (
        <div className="flex align-middle justify-center gap-6 ">
            {mangaList.length > 0 ?
                mangaList.map((manga) => (
                    <MangaCard key={manga.id} {...manga} />
                ))
        :
        <div>Додайте мангу у обрані щоб отримувати рекомендації</div>
        }
            
        </div>
    );
}
