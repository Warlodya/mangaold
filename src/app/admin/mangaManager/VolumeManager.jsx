'use client';

import { useState, useEffect } from 'react';
import PageManager from './PageManager';

export default function VolumeManager({ mangaId }) {
    const [volumes, setVolumes] = useState([]);
    const [newNumber, setNewNumber] = useState('');
    const [newLanguage, setNewLanguage] = useState('UA');
    const [loading, setLoading] = useState(false);

    const load = () => {
        fetch(`/api/mangas/${mangaId}/volumes`)
            .then(res => res.json())
            .then(setVolumes);
    };
    useEffect(load, [mangaId]);

    const addVolume = async () => {
        const num = parseInt(newNumber, 10);
        if (!num || !newLanguage.trim()) return alert('Введіть номер і мову тому');
        setLoading(true);
        const res = await fetch(`/api/mangas/${mangaId}/volumes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: num, language: newLanguage.trim() }),
        });
        if (res.ok) {
            setNewNumber('');
            setNewLanguage('UA');
            load();
        } else {
            const err = await res.json();
            alert(err.error || 'Помилка');
        }
        setLoading(false);
    };

    const deleteVolume = async (id) => {
        if (!confirm('Видалити цей том?')) return;
        await fetch(`/api/mangas/${mangaId}/volumes/${id}`, { method: 'DELETE' });
        load();
    };

    return (
        <div className="flex flex-col items-stretch gap-2">
            <h3 className="text-lg font-semibold">Тома</h3>

            {volumes.length > 0 ? (
                <ul className="flex flex-col items-stretch gap-2 ">
                    {volumes.map(v => (
                        <li key={v.id} className="flex justify-between items-center p-2 text-white border-2 border-blue-800 rounded-lg">
                            <span>
                                Том {v.number}{' '}
                                <span className="text-xs text-gray-600">[{v.language}]</span>
                            </span>
                            <PageManager volumeId={v.id} />
                            <button
                                onClick={() => deleteVolume(v.id)}
                                className="text-white bg-red-600 hover:underline cursor-pointer px-2 py-1 rounded-full"
                            >
                                Видалити
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mb-4 text-sm text-gray-500">Томів поки немає.</p>
            )}

            {/* Форма додавання нового тому */}
            <div className="flex flex-wrap gap-2 items-center">
                <input
                    type="number"
                    min="1"
                    placeholder="Номер тому"
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    disabled={loading}
                    className="w-30 px-2 py-1 border rounded-full"
                />

                <input
                    type="text"
                    placeholder="Мова"
                    value={newLanguage}
                    onChange={e => setNewLanguage(e.target.value)}
                    disabled={loading}
                    className="w-24 px-2 py-1 border rounded-full"
                />

                <button
                    onClick={addVolume}
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-1 rounded-full disabled:opacity-50"
                >
                    {loading ? '...' : 'Додати том'}
                </button>
            </div>
        </div>
    );
}
