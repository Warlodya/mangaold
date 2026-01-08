'use client';

import { useSearchParams } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import dynamic from 'next/dynamic';

const CommentSection = dynamic(() => import('@/app/components/CommentSection'), { ssr: false });

export default function ReaderPage(promiseParams) {
    const { mangaId, volumeId } = use(promiseParams.params);
    const [volume, setVolume] = useState(null);
    const [volumeIndex, setVolumeIndex] = useState(null);
    const [allVolumes, setAllVolumes] = useState([]);
    const [error, setError] = useState(null);
    const pageRefs = useRef([]);
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'UA';
    const [currentLang, setCurrentLang] = useState(lang);

    useEffect(() => {
        setCurrentLang(searchParams.get('lang') || 'UA');
    }, [searchParams]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/mangas/${mangaId}?lang=${currentLang}`, {
                    cache: 'no-store',
                });

                if (!res.ok) throw new Error('Немає манги');
                const data = await res.json();

                const index = data.volumes.findIndex((v) => v.id === volumeId);
                if (index === -1) throw new Error('Том не знайдено');

                setAllVolumes(data.volumes);
                setVolume(data.volumes[index]);
                setVolumeIndex(index);
            } catch (e) {
                setError(e.message);
            }
        };

        load();
    }, [mangaId, volumeId]);

    useEffect(() => {
        const handleKey = (e) => {
            const direction = ['ArrowDown', 's', 'S'].includes(e.key) ? 1 :
                ['ArrowUp', 'w', 'W'].includes(e.key) ? -1 : 0;

            if (direction !== 0 && pageRefs.current.length > 0) {
                const scrollY = window.scrollY;
                const currentIndex = pageRefs.current.findIndex(ref => ref.offsetTop > scrollY + 10);
                const nextIndex = Math.min(Math.max(0, currentIndex + direction), pageRefs.current.length - 1);
                pageRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const renderNavButtons = () => (
        <div className="flex justify-between items-center">
            {volumeIndex > 0 ? (
                <Link
                    href={`/manga/${mangaId}/reader/${allVolumes[volumeIndex - 1].id}?lang=${lang}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    ← До томy {volumeIndex}
                </Link>
            ) : <div />}

            {volumeIndex < allVolumes.length - 1 ? (
                <Link
                    href={`/manga/${mangaId}/reader/${allVolumes[volumeIndex + 1].id}?lang=${lang}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    До томy {volumeIndex + 2} →
                </Link>
            ) : <div />}
        </div>
    );

    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!volume) return <div className="p-4">Завантаження...</div>;

    console.log(allVolumes)

    return (
        <div>
            <Header />
            <main className="p-4 max-w-4xl mx-auto flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                    <Link
                        href={`/manga/${mangaId}`}
                        className="bg-white text-black px-4 py-2 rounded-full hover:bg-blue-400"
                    >
                        До манги
                    </Link>
                    <Link
                        href={`#comments`}
                        className="bg-white text-black px-4 py-2 rounded-full hover:bg-blue-400"
                    >
                        Коментарі
                    </Link>
                </div>
                {allVolumes.length > 1 ? renderNavButtons() : ''}
                <h1 className="text-2xl font-bold">Том {volumeIndex + 1}</h1>
                <div className="flex flex-col">
                    {volume.pages.map((page, index) => (
                        <div
                            key={page.id}
                            ref={(el) => (pageRefs.current[index] = el)}
                            className="w-full"
                        >
                            <Image
                                src={`/manga_pages/${page.imageUrl}`}
                                alt={`Страница ${index + 1}`}
                                width={800}
                                height={1200}
                                className="w-full h-auto object-contain shadow"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                {allVolumes.length > 1 ? renderNavButtons() : ''}

                <CommentSection
                    volumeId={volume.id}
                    mangaId={mangaId}
                />
            </main>
        </div>
    );
}
