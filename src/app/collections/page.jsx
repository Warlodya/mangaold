'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/Header';

export default function CollectionsPage() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCollections() {
            try {
                const res = await fetch('/api/collections', { method: "GET" });
                if (!res.ok) throw new Error('Network response was not ok');
                const json = await res.json();
                setCollections(json || []);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити колекції');
            } finally {
                setLoading(false);
            }
        }
        fetchCollections();
    }, []);

    const calculateAverageRating = (mangas) => {
        if (!mangas || mangas.length === 0) return 0;
        const total = mangas.reduce((sum, m) => sum + (m.rating?.score || 0), 0);
        return total / mangas.length;
    };

    if (loading) return <p className="p-6">Завантаження...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <>
            <Header />
            <div className="px-6 py-8">
                <h1 className="text-3xl font-bold mb-6">Колекції Манґ</h1>
                <div className="flex flex-wrap gap-6">
                    {collections.map(collection => {
                        const avgRating = calculateAverageRating(collection.mangas);
                        const fullStars = Math.floor(avgRating);

                        return (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.id}`}
                                className="relative bg-white rounded-2xl overflow-hidden shadow flex flex-col justify-center p-2"
                            >
                                <div className="flex flex-row gap-1 justify-center">
                                    {(collection.mangas || []).slice(0, 5).map(manga => (
                                        <div
                                            key={manga.id}
                                            className="w-16 h-24 relative flex-shrink-0 rounded-2xl overflow-hidden shadow"
                                        >
                                            <Image
                                                src={manga.coverUrl || '/placeholder.jpg'}
                                                alt={manga.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2">
                                    <h2 className="text-xl font-semibold text-black">{collection.name}</h2>
                                    {collection.description && (
                                        <p className="text-gray-400 text-sm mt-1">{collection.description}</p>
                                    )}
                                    <div className="mt-2 text-yellow-400">
                                        {Array.from({ length: fullStars }, (_, i) => (
                                            <span key={i}>✦</span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
