'use client';

import { useState, useEffect } from 'react';
import VolumeManager from './VolumeManager';

export default function MangaEditor() {
    const [mangas, setMangas] = useState([]);
    const [mode, setMode] = useState('list');
    const [form, setForm] = useState({
        title: '',
        originalTitle: '',
        description: '',
        tags: [],
    });
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newTag, setNewTag] = useState('');
    const [editingTagIndex, setEditingTagIndex] = useState(null);
    const [editingTagValue, setEditingTagValue] = useState('');

    const load = () => {
        fetch('/api/mangas')
            .then(res => res.json())
            .then(setMangas);
    };
    useEffect(load, []);


    const handleInput = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleAdd = async () => {
        setLoading(true);
        const res = await fetch('/api/mangas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const created = await res.json();
            setMangas(m => [created, ...m]);
            reset();
        } else {
            const err = await res.json();
            alert(err.error || 'Ошибка');
        }
        setLoading(false);
    };

    const handleEdit = manga => {
        setEditId(manga.id);
        setForm({
            title: manga.title,
            originalTitle: manga.originalTitle || '',
            description: manga.description || '',
            tags: manga.tags?.map(tag => tag) || [],
        });
        setMode('edit');
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await fetch(`/api/mangas/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const updated = await res.json();
            setMangas(m => m.map(x => (x.id === updated.id ? updated : x)));
            reset();
        } else {
            const err = await res.json();
            alert(err.error || 'Помилка');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Ви впевнені, що хочете видалити цю мангу?')) return;
        setLoading(true);
        const res = await fetch(`/api/mangas/${editId}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            setMangas(m => m.filter(x => x.id !== editId));
            reset();
        } else {
            const err = await res.json();
            alert(err.error || 'Помилка видалення');
        }
        setLoading(false);
    };

    const reset = () => {
        setForm({ title: '', originalTitle: '', description: '', tags: [] });
        setEditId(null);
        setMode('list');
        setNewTag('');
        setEditingTagIndex(null);
        setEditingTagValue('');
    };

    // ===== TAGS =====
    const addTag = () => {
        if (newTag.trim() && !form.tags.includes(newTag.trim())) {
            setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const removeTag = (index) => {
        setForm(f => ({ ...f, tags: f.tags.filter((_, i) => i !== index) }));
    };

    const startEditTag = (index, value) => {
        setEditingTagIndex(index);
        setEditingTagValue(value);
    };

    const applyEditTag = () => {
        if (!editingTagValue.trim()) return;
        setForm(f => ({
            ...f,
            tags: f.tags.map((t, i) =>
                i === editingTagIndex ? editingTagValue.trim() : t
            ),
        }));
        setEditingTagIndex(null);
        setEditingTagValue('');
    };

    return (
        <div className="flex gap-6">
            <aside className="w-1/3 p-4 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Манга</h2>
                <button
                    className={`mb-4 px-3 py-1 rounded-full ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => { reset(); setMode('add'); }}
                >
                    + Додати мангу
                </button>

                <ul className="space-y-2 max-h-[400px] overflow-auto">
                    {mangas.map(m => (
                        <li
                            key={m.id}
                            className="p-2 hover:bg-gray-100 hover:text-black rounded-full cursor-pointer"
                            onClick={() => handleEdit(m)}
                        >
                            {m.title}
                        </li>
                    ))}
                </ul>
            </aside>

            <section className="flex-1 p-4 border rounded-lg">
                {mode === 'list' && (
                    <p>Оберіть «Додати мангу» або клікніть на існуючій для редагування.</p>
                )}

                {(mode === 'add' || mode === 'edit') && (
                    <div className="flex flex-col items-stretch gap-2">
                        <h2 className="text-lg font-semibold">
                            {mode === 'add' ? 'Нова манга' : 'Редагування'}
                        </h2>
                        <div className="flex flex-col items-stretch gap-3">
                            <div className="flex flex-col items-stretch gap-1">
                                <label className="block font-medium">Назва *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleInput}
                                    className="w-full p-2 border rounded-lg"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex flex-col items-stretch gap-1">
                                <label className="block font-medium">Оригінальна назва</label>
                                <input
                                    name="originalTitle"
                                    value={form.originalTitle}
                                    onChange={handleInput}
                                    className="w-full p-2 border rounded-lg"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex flex-col items-stretch gap-1">
                                <label className="block font-medium">Опис</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInput}
                                    className="w-full p-2 border rounded-lg"
                                    rows={4}
                                    disabled={loading}
                                />
                            </div>

                            {/* TAG EDITOR */}
                            <div className="flex flex-col items-stretch gap-1">
                                <label className="block font-medium">Теги</label>
                                {form.tags.length>0 && <div className="flex gap-2 flex-wrap">
                                    {form.tags.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-row items-center gap-2 bg-gray-200 text-black px-2 py-1 rounded-full"
                                        >
                                            {editingTagIndex === index ? (
                                                <input
                                                    value={editingTagValue}
                                                    onChange={e => setEditingTagValue(e.target.value)}
                                                    onBlur={applyEditTag}
                                                    onKeyDown={e => e.key === 'Enter' && applyEditTag()}
                                                    className="p-1 rounded text-sm"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => startEditTag(index, tag)}
                                                    className="cursor-pointer"
                                                >
                                                    {tag}
                                                </span>
                                            )}
                                            <button onClick={() => removeTag(index)} className="text-red-500 font-bold">×</button>
                                        </div>
                                    ))}
                                </div>}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        className="p-2 border rounded-lg w-full"
                                        placeholder="Новий тег"
                                    />
                                    <button
                                        onClick={addTag}
                                        className="bg-blue-600 text-white px-3 py-2 rounded-full"
                                    >
                                        Додати
                                    </button>
                                </div>
                            </div>

                            {mode === 'edit' && <VolumeManager mangaId={editId} />}
                            <div className="flex gap-2">
                                {mode === 'add' ? (
                                    <button
                                        onClick={handleAdd}
                                        disabled={loading || !form.title.trim()}
                                        className="bg-green-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                    >
                                        {loading ? 'Зберігаю...' : 'Зберегти'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || !form.title.trim()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                    >
                                        {loading ? 'Зберігаю...' : 'Зберегти зміни'}
                                    </button>
                                )}
                                <button
                                    onClick={reset}
                                    disabled={loading}
                                    className="bg-gray-300 text-black px-4 py-2 rounded-full"
                                >
                                    Відміна
                                </button>
                                {mode === 'edit' && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="bg-red-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
                                    >
                                        {loading ? 'Видаляю...' : 'Видалити'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
