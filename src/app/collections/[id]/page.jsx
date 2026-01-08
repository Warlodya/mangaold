'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import MangaCard from '@/app/components/MangaCard';
import CopyLinkButton from '@/app/components/CopyLinkButton';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCollection() {
            try {
                const res = await fetch(`/api/collections/${id}`);
                if (res.status === 404) {
                    setError('Колекцію не знайдено');
                    return;
                }
                if (!res.ok) throw new Error('Network response was not ok');
                setCollection(await res.json());
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити колекцію');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchCollection();
    }, [id]);

    const calculateAverageRating = (mangas) => {
        if (!mangas || mangas.length === 0) return 0;
        const total = mangas.reduce((sum, m) => sum + (m.rating?.score || 0), 0);
        return total / mangas.length;
    };

    if (loading) return <p className="p-6">Завантаження...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    const fullStars = calculateAverageRating(collection.mangas);

    return (
        <>
            <Header />
            <div className="px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Блок с информацией о коллекции */}
                    <div className="lg:w-1/3 flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">Колекція: {collection.name}</h1>
                        {collection.description && (
                            <p className="text-gray-600">{collection.description}</p>
                        )}

                        <div className="flex gap-1">
                            Середній рейтинг:
                            <div className="text-yellow-400 text-xl">
                                {'✦'.repeat(fullStars)}
                            </div>
                        </div>

                        <CopyLinkButton />
                    </div>

                    {/* Блок с мангами */}
                    <div className="lg:w-2/3 flex flex-wrap gap-6 justify-center">
                        {collection.mangas.map((manga) => (
                            <MangaCard key={manga.id} {...manga} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
