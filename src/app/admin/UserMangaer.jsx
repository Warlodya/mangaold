'use client';

import { useState, useEffect } from 'react';

const ROLES = ['USER', 'AUTHOR', 'ADMIN'];

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(setUsers);
    }, []);

    const changeRole = async (id, newRole) => {
        setLoadingId(id);
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            const updated = await res.json();
            setUsers(u => u.map(x => x.id === id ? updated : x));
        } else {
            alert('Не вдалося оновити роль');
        }
        setLoadingId(null);
    };

    const deleteUser = async (id) => {
        if (!confirm('Удалить пользователя?')) return;
        setLoadingId(id);
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setUsers(u => u.filter(x => x.id !== id));
        } else {
            alert('Не вдалося видалити користувача');
        }
        setLoadingId(null);
    };

    return (
        <div className="p-4 border rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-4 text-black">Редактор користувачів</h2>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="text-black">
                        <th className="border px-2 py-1">Ім'я</th>
                        <th className="border px-2 py-1">Email</th>
                        <th className="border px-2 py-1">Роль</th>
                        <th className="border px-2 py-1">Дії</th>
                    </tr>
                </thead>
                <tbody className='text-black'>
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">{u.name}</td>
                            <td className="border px-2 py-1">{u.email}</td>
                            <td className="border px-2 py-1">
                                <select
                                    value={u.role}
                                    disabled={loadingId === u.id}
                                    onChange={e => changeRole(u.id, e.target.value)}
                                    className="p-1 border rounded"
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="border px-2 py-1 text-center">
                                <button
                                    onClick={() => deleteUser(u.id)}
                                    disabled={loadingId === u.id}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
