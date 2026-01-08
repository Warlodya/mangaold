'use client'

import Header from '@/app/components/Header';
import MangaList from '@/app/components/MangaList';
import SearchBar from './components/SearchBar';
import { useState, useEffect } from 'react';
import Recommendations from '@/app/components/Recommendations'

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setIsAuthenticated(true);
                    }
                }
            } catch (err) {
                console.error('Помилка отримання користувача:', err);
            }
        };

        loadUser();
    }, []);

    return (
        <div>
            <Header />
            <main className="p-4 flex flex-col justify-center align-middle gap-2">
                <SearchBar />
                <h1 className="text-3xl font-semibold">Вітаємо в енциклопедії манга!</h1>
                <p>Тут, тільки найкраща манга.</p>


                {isAuthenticated && <div className='flex flex-col justify-center align-middle gap-2'>
                    <h1 className="text-3xl font-semibold w-fit">Рекомендації</h1>
                    <Recommendations />
                </div>}

                <div className='flex flex-col justify-center align-middle gap-2'>
                    <h1 className="text-3xl font-semibold w-fit">Остання манга</h1>
                    <MangaList />
                </div>
            </main>
        </div>
    );
}
