'use client';

import { useEffect, useState } from 'react';
import MangaCard from '@/app/components/MangaCard'
import Header from '@/app/components/Header';

export default function ViewHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch('/api/history');
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                } else {
                    console.error('Помилка завантаження історії');
                }
            } catch (err) {
                console.error('Помилка запиту:', err);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    if (loading) return <p className="p-4">Завантаження...</p>;

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Історія переглядів</h1>
            {history.length === 0 ? (
                <p>Історія переглядів порожня.</p>
            ) : (
                <div className="flex flex-row items-center justify-center flex-wrap gap-6">
                    {history.map((manga) => (
                        <MangaCard key={manga.id} {...manga} />
                    ))}
                </div>
            )}
        </div>
    );
}
