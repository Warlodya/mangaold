'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import Header from '../components/Header';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });

    const submit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(form),
        });

        if (res.ok) router.push('/');
        else alert('Ошибка входа');
    };

    return (
        <div className='min-h-screen'>
            <Header />
            <form onSubmit={submit} className="p-4 max-w-md mx-auto space-y-4 relative">
                <Image
                    src='/pointer-girl.png'
                    width={200}
                    height={200}
                    alt='pointer girl'
                    className='absolute right-full'
                />
                <h1 className="text-2xl font-bold">Увійти</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2 border rounded-full"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2 border rounded-full"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full">
                    Увійти
                </button>
            </form>
        </div>
    );
}
