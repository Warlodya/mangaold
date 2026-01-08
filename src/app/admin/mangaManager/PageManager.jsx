'use client';

import { useState, useEffect } from 'react';

export default function PageManager({ mangaId, volumeId }) {
    const [pages, setPages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!volumeId) return;
        fetch(`/api/mangas/${mangaId}/volumes/${volumeId}/pages`)
            .then(res => res.json())
            .then(setPages);
    }, [mangaId, volumeId]);

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Помилка вивантаження');
        }
        const json = await res.json();
        return json.filename;
    };

    const handleFileChange = (e) => {
        setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const uploadNew = async () => {
        if (!volumeId) return;
        setLoading(true);
        try {
            for (const file of newFiles) {
                const filename = await handleFileUpload(file);
                const imageUrl = filename;
                const res = await fetch(
                    `/api/mangas/${mangaId}/volumes/${volumeId}/pages`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl }),
                    }
                );
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Помилка збережння сторінки');
                }
                const created = await res.json();
                setPages(p => [...p, created]);
            }
            setNewFiles([]);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const move = (idx, dir) => {
        const arr = [...pages];
        const j = idx + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        setPages(arr.map((p, i) => ({ ...p, order: i + 1 })));
    };

    const saveOrder = async () => {
        setLoading(true);
        await fetch(
            `/api/mangas/${mangaId}/volumes/${volumeId}/pages/order`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pages }),
            }
        );
        setLoading(false);
    };

    // Удаление страницы
    const handleDelete = async (pageId) => {
        if (!confirm('Видалити сторінку?')) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/mangas/${mangaId}/volumes/${volumeId}/pages/${pageId}`,
                { method: 'DELETE' }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Не вдалося видалити сторінку');
            }
            setPages(pages.filter(p => p.id !== pageId));
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-semibold">Сторінки тому</h3>

            <div className="flex flex-row justify-center">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-2 border-black px-2 py-1 rounded-full"
                    disabled={loading}
                />
                {newFiles.length > 0 && (
                    <button
                        onClick={uploadNew}
                        disabled={loading}
                        className="ml-2 bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                        {loading ? 'Завантажую...' : `Завантажити ${newFiles.length} файлів`}
                    </button>
                )}
            </div>

            <ul className="flex flex-wrap gap-2">
                {pages.map((p, idx) => (
                    <li
                        key={p.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border-2 text-black"
                    >
                        <span>#{p.order}</span>
                        <img
                            src={'manga_pages/' + p.imageUrl}
                            alt=""
                            className="max-w-20 max-h-20 object-cover rounded"
                        />
                        <button
                            onClick={() => move(idx, -1)}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-200 rounded hover:outline-2 outline-blue-500"
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => move(idx, +1)}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-200 rounded hover:outline-2 outline-blue-500"
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => handleDelete(p.id)}
                            disabled={loading}
                            className="ml-auto text-red-600 hover:underline text-sm"
                        >
                            Видалити
                        </button>
                    </li>
                ))}
            </ul>

            <button
                onClick={saveOrder}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 disabled:opacity-50 w-fit rounded-full"
            >
                {loading ? 'Зберігаю...' : 'Зберегти порядок'}
            </button>
        </div>
    );
}
