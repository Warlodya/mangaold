'use client';

import { useState, useEffect } from 'react';
import MangaCard from '@/app/components/MangaCard';

export default function UserCollectionEditor({ user }) {
    const [collections, setCollections] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', mangas: [] });
    const [editId, setEditId] = useState(null); // id або 'new'
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (user) fetchUserCollections();
    }, [user]);

    async function fetchUserCollections() {
        const res = await fetch('/api/collections');
        const data = await res.json();
        const userCollections = data.filter(c => c.authorId === user.id);
        setCollections(userCollections);
    }

    function reset() {
        setForm({ name: '', description: '', mangas: [] });
        setEditId(null);
        setQuery('');
        setResults([]);
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
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

    async function handleSave() {
        setLoading(true);
        const body = {
            name: form.name,
            description: form.description,
            mangaIds: form.mangas.map(m => m.id),
        };
        const method = editId && editId !== 'new' ? 'PUT' : 'POST';
        const url = editId && editId !== 'new'
            ? `/api/collections/${editId}`
            : `/api/collections`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            await fetchUserCollections();
            reset();
        } else {
            alert('Помилка збереження');
        }
        setLoading(false);
    }

    async function handleDelete() {
        if (!confirm('Ви впевнені?')) return;
        setLoading(true);
        const res = await fetch(`/api/collections/${editId}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchUserCollections();
            reset();
        } else {
            alert('Помилка видалення');
        }
        setLoading(false);
    }

    function openEditor(mode, collection = null) {
        if (mode === 'new') {
            setEditId('new');
            setForm({ name: '', description: '', mangas: [] });
        } else {
            setEditId(collection.id);
            setForm({
                name: collection.name,
                description: collection.description || '',
                mangas: collection.mangas || [],
            });
        }
        setQuery('');
        setResults([]);
    }

    return (
        <ul className="flex flex-col gap-2 text-black">
            <li className="border rounded">
                <div
                    onClick={() => openEditor('new')}
                    className={`p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 ${editId === 'new' ? "rounded-t-lg" : "rounded-lg"}`}
                >
                    Додати нову колекцію
                </div>
                {editId === 'new' && (
                    <Editor
                        form={form}
                        onChange={handleInput}
                        query={query}
                        onQueryChange={handleQueryChange}
                        results={results}
                        toggleManga={toggleManga}
                        handleSave={handleSave}
                        handleCancel={reset}
                        loading={loading}
                    />
                )}
            </li>

            {collections.map(c => (
                <li key={c.id} className="border">
                    <div
                        onClick={() => openEditor('edit', c)}
                        className={`p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 ${editId === c.id ? "rounded-t-lg" : "rounded-lg"}`}
                    >
                        {c.name}
                    </div>
                    {editId === c.id && (
                        <Editor
                            form={form}
                            onChange={handleInput}
                            query={query}
                            onQueryChange={handleQueryChange}
                            results={results}
                            toggleManga={toggleManga}
                            handleSave={handleSave}
                            handleCancel={reset}
                            handleDelete={handleDelete}
                            loading={loading}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}

function Editor({
    form,
    onChange,
    query,
    onQueryChange,
    results,
    toggleManga,
    handleSave,
    handleCancel,
    handleDelete,
    loading
}) {
    return (
        <div className="space-y-4 p-4 bg-white rounded-b-lg">
            <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Назва"
                className="w-full p-2 border rounded"
                disabled={loading}
            />
            <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Опис"
                className="w-full p-2 border rounded"
                rows={2}
                disabled={loading}
            />

            <div>
                <label className="font-medium block mb-1">Додати манґу</label>
                <input
                    type="text"
                    value={query}
                    onChange={onQueryChange}
                    className="w-full p-2 border rounded"
                    placeholder="Пошук за назвою або тегом"
                />
                <div className="flex flex-wrap gap-4 mt-2">
                    {results.map(m => (
                        <div key={m.id} className="relative rounded-lg overflow-hidden">
                            <div className="pointer-events-none">
                                <MangaCard {...m} />
                            </div>
                            <button
                                onClick={() => toggleManga(m)}
                                className="absolute top-2 right-2 bg-white text-black rounded-full p-1 border"
                            >
                                {form.mangas.some(x => x.id === m.id) ? '−' : '+'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {form.mangas.length > 0 && (
                <div>
                    <h4 className="font-medium mb-2">Додані манґи</h4>
                    <div className="flex flex-wrap gap-4">
                        {form.mangas.map(m => (
                            <div key={m.id} className="relative rounded-lg overflow-hidden">
                                <div className="pointer-events-none">
                                    <MangaCard {...m} />
                                </div>
                                <button
                                    onClick={() => toggleManga(m)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                                >×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    disabled={loading || !form.name.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >{loading ? 'Зберігаю...' : 'Зберегти'}</button>

                <button
                    onClick={handleCancel}
                    className="bg-gray-300 px-4 py-2 rounded"
                    disabled={loading}
                >Відміна</button>

                {handleDelete && (
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >{loading ? 'Видаляю...' : 'Видалити'}</button>
                )}
            </div>
        </div>
    );
}
