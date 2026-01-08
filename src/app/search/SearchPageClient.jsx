'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MangaCard from '@/app/components/MangaCard';
import SearchBar from '@/app/components/SearchBar';
import Header from '@/app/components/Header';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setMangaList(data.mangas || []);
            setLoading(false);
        };

        if (query) fetchData();
    }, [query]);


    return (
        <div>
            <Header />
            <div className="mt-6 px-4">
                <SearchBar />
                <h2 className="text-2xl font-semibold mt-6 mb-4">Результати для: "{query}"</h2>

                {loading ? (
                    <div>Завантаження...</div>
                ) : mangaList.length === 0 ? (
                    <div>Нічого не знайдено.</div>
                ) : (
                    <div className="flex align-middle justify-center gap-6">
                        {mangaList.map((manga) => (
                            <MangaCard key={manga.id} {...manga} />
                        ))}
                    </div>
                )}
            </div>
        </div>

    );
}

export const dynamic = 'force-dynamic'