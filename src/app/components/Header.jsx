'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProfileDropdown from './ProfileDropdown';
import Image from 'next/image'

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setIsAuthenticated(true);
                        setUser(data);
                    }
                }
            } catch (err) {
                console.error('Помилка отримання користувача:', err);
            }
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="flex flex-row items-center gap-2">
                <Image
                    src="/icon.png"
                    alt='manga-icon'
                    width={40}
                    height={40}
                />
                <div className="text-xl font-bold">СЕМ</div>
            </div>

            <nav className="flex space-x-4">
                <Link href="/" className="hover:underline">Головна</Link>
                <Link href="/collections" className="hover:underline">Коллекції</Link>
                <Link href="/manga/random" className="hover:underline">Мені повезе!</Link>

                {isAuthenticated && user?.role === 'ADMIN' && (
                    <Link href="/admin" className="hover:underline">Адмін панель</Link>
                )}
            </nav>

            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <>
                        <ProfileDropdown user={user} onLogout={handleLogout} />
                    </>
                ) : (
                    <>
                        <Link href="/login" className="bg-blue-600 px-3 py-1 rounded-full">Увійти</Link>
                        <Link href="/register" className="bg-green-600 px-3 py-1 rounded-full">Створити профіль</Link>
                    </>
                )}
            </div>
        </header>
    );
}
