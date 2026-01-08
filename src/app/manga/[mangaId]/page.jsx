'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Link from 'next/link';
import MangaReviews from '@/app/components/MangaReviews';
import ReviewForm from '@/app/components/ReviewForm';
import FavoriteButton from '@/app/components/FavoriteButton';
import CopyLinkButton from '@/app/components/CopyLinkButton';

export default function MangaPage(promiseParams) {
    const router = useRouter();
    const { mangaId } = use(promiseParams.params);

    const [manga, setManga] = useState(null);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                setIsAuth(!!data);
            } catch {
                setIsAuth(false);
            }
        }
        checkAuth();
    }, []);

    const reloadScores = () => {
        setScore((sc) => sc + 1);
    };

    useEffect(() => {
        const recordView = async () => {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ mangaId }),
            });
        };
        recordView();
    }, [mangaId]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/mangas/${mangaId}`, {
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Мангу не знайдено');
                const data = await res.json();
                setManga(data);
            } catch (e) {
                setError(e.message);
            }
        };
        load();
    }, [mangaId]);

    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!manga) return <div className="p-4">Завантаження...</div>;

    const volumesByLanguage = manga.volumes.reduce((acc, vol) => {
        const lang = vol.lang || 'UA';
        if (!acc[lang]) acc[lang] = [];
        acc[lang].push(vol);
        return acc;
    }, {});

    return (
        <div>
            <Header />
            <main className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
                <div className="relative flex flex-col md:flex-row gap-6">
                    <div className="relative flex-shrink-0">
                        <Image
                            src={manga.coverUrl || '/manga_placeholder.png'}
                            alt={manga.title}
                            width={300}
                            height={400}
                            className="rounded shadow"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl font-bold">{manga.title}</h1>
                        <p className="text-gray-500 text-lg">{manga.originalTitle}</p>
                        {manga.rating.score && (
                            <div className="text-white" key={score}>
                                Рейтинг:{' '}
                                {Array(Math.floor(manga.rating.score))
                                    .fill(null)
                                    .map((_, i) => (
                                        <span key={i} className="text-yellow-300">
                                            ✦
                                        </span>
                                    ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <div>Томи</div>
                            {Object.entries(volumesByLanguage).map(([lang, vols]) => (
                                <div key={lang} className="flex items-center gap-1">
                                    <span className="">{lang}:</span>
                                    {vols.map((volume) => (
                                        <Link
                                            key={volume.id}
                                            href={`/manga/${manga.id}/reader/${volume.id}?lang=${lang}`}
                                            className="bg-gray-100 hover:bg-blue-500 text-sm text-black hover:text-white px-3 py-1 rounded-full shadow transition"
                                        >
                                            {volume.number}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {manga.tags.length > 0 && <div className="flex flex-wrap items-center gap-2">
                            <div>Теги:</div>
                            {manga.tags.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                                    className="bg-gray-200 hover:bg-gray-300 text-black text-sm px-3 py-1 rounded-full cursor-pointer"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>}

                        {isAuth && <FavoriteButton mangaId={manga.id} />}
                        <CopyLinkButton />
                    </div>
                </div>

                {manga.description && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-semibold">Опис</h2>
                        <p className="text-white whitespace-pre-line break-all">{manga.description}</p>
                    </div>
                )}

                {isAuth && <ReviewForm mangaId={manga.id} onReviewAdded={reloadScores} />}
                <MangaReviews mangaId={manga.id} key={score} />
            </main>
        </div>
    );
}
