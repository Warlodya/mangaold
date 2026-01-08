'use client';

import { useState, useEffect } from 'react';

export default function CommentForm({ mangaId, volumeId, parentId, onSubmit }) {
    const [content, setContent] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Помилка завантаження користувача:', err);
            }
        };

        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !content.trim()) return;

        const res = await fetch(`/api/mangas/${mangaId}/volumes/${volumeId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                parentId,
            }),
            credentials: 'include',
        });

        if (res.ok) {
            setContent('');
            if (onSubmit) onSubmit();
        } else {
            console.error('Помилка при відправці коментаря');
        }
    };

    if (!user) {
        return (
            <p className="text-gray-500 italic">Увійдіть щоб залишити коментар.</p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 justify-start">
            <textarea
                className="w-full p-2 border rounded"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? 'Відповідь на коментар...' : 'Залиште коментар'}
            />
            <button
                type="submit"
                className=" px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Відправити
            </button>
        </form>
    );
}
