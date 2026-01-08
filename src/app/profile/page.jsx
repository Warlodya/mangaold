'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import FavouritePage from './Favourites';
import ViewHistoryPage from './History';
import UserCollectionEditor from './UserCollectionEditor';

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
            router.push('/')
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen text-white">
                <Header />
                <div className="p-6">Завантаження профілю...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <Header />

            <main className="p-6 max-w-3xl mx-auto flex flex-col items-stretch gap-6">
                <h1 className="text-2xl font-bold">Профіль користувача</h1>

                <div className="bg-white text-black rounded-lg shadow p-4 flex flex-col gap-2">
                    <p><strong>Ім’я:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-500"
                        >
                            Вийти
                        </button>
                    </p>
                </div>

                <UserCollectionEditor user={user} />

                <FavouritePage />
                <ViewHistoryPage />
            </main>
        </div>
    );
}
