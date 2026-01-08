// app/components/CollectionEditor.jsx
'use client';

import { useState, useEffect } from 'react';
import MangaCard from '@/app/components/MangaCard';

export default function CollectionEditor() {
    const [collections, setCollections] = useState([]);
    const [mode, setMode] = useState('list');
    const [form, setForm] = useState({ name: '', description: '', mangas: [] });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    // поиск
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => { fetchCollections(); }, []);
    async function fetchCollections() {
        const res = await fetch('/api/collections', { method: "GET" });
        const data = await res.json();
        setCollections(data);
    }

    async function handleQueryChange(e) {
        const q = e.target.value;
        setQuery(q);
        if (!q.trim()) {
            setResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const { mangas } = await res.json();
            setResults(mangas);
        } catch (err) {
            console.error('Search error', err);
        }
    }

    function reset() {
        setForm({ name: '', description: '', mangas: [] });
        setEditId(null);
        setMode('list');
        setQuery('');
        setResults([]);
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    function toggleManga(manga) {
        setForm(f => {
            const exists = f.mangas.find(m => m.id === manga.id);
            return {
                ...f,
                mangas: exists
                    ? f.mangas.filter(m => m.id !== manga.id)
                    : [...f.mangas, manga],
            };
        });
    }

    async function handleAdd() {
        setLoading(true);
        const body = {
            name: form.name,
            description: form.description,
            mangaIds: form.mangas.map(m => m.id),
        };
        const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            await fetchCollections();
            reset();
        } else alert('Помилка створення');
        setLoading(false);
    }

    function handleEdit(c) {
        setEditId(c.id);
        setMode('edit');
        setForm({
            name: c.name,
            description: c.description || '',
            mangas: c.mangas,
        });
    }

    async function handleSave() {
        setLoading(true);
        const body = {
            name: form.name,
            description: form.description,
            mangaIds: form.mangas.map(m => m.id),
        };
        const res = await fetch(`/api/collections/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            await fetchCollections();
            reset();
        } else alert('Помилка збереження');
        setLoading(false);
    }

    async function handleDelete() {
        if (!confirm('Ви впевнені?')) return;
        setLoading(true);
        const res = await fetch(`/api/collections/${editId}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchCollections();
            reset();
        } else alert('Помилка видалення');
        setLoading(false);
    }

    return (
        <div className="flex gap-6">
            <aside className="w-1/3 p-4 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Колекції</h2>
                <button
                    className={`mb-4 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-600 hover:text-white ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => { reset(); setMode('add'); }}
                >
                    Додати колекцію
                </button>
                <ul className="flex flex-col gap-2 overflow-auto">
                    {console.log(collections)}
                    {collections.map(c => (
                        <li
                            key={c.id}
                            className="p-2 hover:bg-gray-100 hover:text-black rounded-full cursor-pointer"
                            onClick={() => handleEdit(c)}
                        >{c.name}</li>
                    ))}
                </ul>
            </aside>

            <section className="flex-1 p-4 border rounded-lg">
                {mode === 'list' && <p>Оберіть «Додати колекцію» або клікніть на існуючу.</p>}
                {(mode === 'add' || mode === 'edit') && (
                    <div className="flex flex-col items-stretch gap-3">
                        <div className="space-y-2">
                            <label className="block font-medium ">Назва *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleInput}
                                disabled={loading}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-medium">Опис</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleInput}
                                disabled={loading}
                                className="w-full p-2 border rounded-lg"
                                rows={2}
                            />
                        </div>

                        {/* Поиск */}
                        <div className="space-y-2">
                            <label className="block font-medium">Шукати манґу</label>
                            <input
                                type="text"
                                value={query}
                                onChange={handleQueryChange}
                                disabled={loading}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Введіть назву або тег"
                            />
                            {results.length > 0 && <div className="flex flex-wrap gap-4">
                                {results.map(m => (
                                    <div key={m.id} className="relative rounded-lg overflow-hidden">
                                        <div className="pointer-events-none">
                                            <MangaCard {...m} />
                                        </div>
                                        <button
                                            onClick={() => toggleManga(m)}
                                            className="absolute top-2 right-2 bg-white text-black rounded-full p-1 pointer-events-auto border border-black"
                                        >
                                            {form.mangas.some(x => x.id === m.id) ? '−' : '+'}
                                        </button>
                                    </div>
                                ))}
                            </div>}
                        </div>

                        {/* Выбранные */}
                        {form.mangas.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium">Вибрані манґи</h3>
                                <div className="flex flex-wrap gap-4">
                                    {form.mangas.map(m => (
                                        <div key={m.id} className="relative rounded-lg overflow-hidden">
                                            <div className="pointer-events-none">
                                                <MangaCard {...m} />
                                            </div>
                                            <button
                                                onClick={() => toggleManga(m)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 pointer-events-auto"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Действия */}
                        <div className="flex gap-2">
                            {mode === 'add' ? (
                                <button
                                    onClick={handleAdd}
                                    disabled={loading || !form.name.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                >{loading ? 'Зберігаю...' : 'Зберегти'}</button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !form.name.trim()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                >{loading ? 'Зберігаю...' : 'Зберегти зміни'}</button>
                            )}
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="bg-gray-300 text-black px-4 py-2 rounded-full"
                            >Відміна</button>
                            {mode === 'edit' && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                >{loading ? 'Видаляю...' : 'Видалити'}</button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}