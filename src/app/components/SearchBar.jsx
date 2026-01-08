'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MangaCard from './MangaCard';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ mangas: [], tags: [] });
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();
    const resultsRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (query.trim().length === 0) {
            setResults({ mangas: [], tags: [] });
            return;
        }

        const timeout = setTimeout(async () => {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
            setShowResults(true);
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleTagClick = (tag) => {
        router.push(`/search?q=${encodeURIComponent(tag)}`);
    };

    // Скрытие при потере фокуса
    const handleBlur = () => {
        // Подождем, завершится ли клик по результатам
        setTimeout(() => {
            if (
                !document.activeElement ||
                (!inputRef.current?.contains(document.activeElement) &&
                    !resultsRef.current?.contains(document.activeElement))
            ) {
                setShowResults(false);
            }
        }, 100);
    };

    return (
        <div className="relative w-full flex flex-col items-center">
            <form
                onSubmit={handleSubmit}
                className="flex gap-2 w-full max-w-xl mb-2 justify-center"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук за назвою або тегом..."
                    className="w-full p-2 rounded-full border-2"
                    onFocus={() => {
                        if (query) setShowResults(true);
                    }}
                    onBlur={handleBlur}
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                >
                    Пошук
                </button>
            </form>

            {showResults && query && (
                <div
                    ref={resultsRef}
                    className="absolute top-full mt-2 w-[90vw] max-w-5xl bg-black border-white border-2 rounded-lg shadow-md p-4 z-10"
                    onMouseDown={(e) => {
                        // предотвращаем закрытие при клике по результатам
                        e.preventDefault();
                    }}
                >
                    <h3 className="font-semibold mb-2">Манґа:</h3>
                    <div className="flex flex-row flex-wrap gap-2 justify-center">
                        {results.mangas.slice(0, 5).map((manga) => (
                            <MangaCard key={manga.id} {...manga} />
                        ))}
                    </div>

                    {results.tags.length > 0 && (
                        <>
                            <h3 className="font-semibold mb-2">Теги:</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {results.tags.slice(0, 20).map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagClick(tag.name)}
                                        className="bg-gray-200 hover:bg-gray-300 text-black text-sm px-3 py-1 rounded-full"
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
