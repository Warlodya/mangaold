import Header from '@/app/components/Header';
import { getCurrentUser } from '@/lib/getCurrentUser';
import AdminOptions from './AdminOptions';
import { use } from 'react';

export default async function Admin() {
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    if (!isAuthenticated && ["ADMIN","AUTHOR"].includes(user.role)) {
        return (
            <div>
                <Header isAuthenticated={false} user={null} />
                <main className="p-4">
                    <h1 className="text-3xl font-semibold">Ви не авторизовані</h1>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Header isAuthenticated={true} user={user} />
            <main className="p-4">
                <h1 className="text-2xl font-bold mb-4">Адмін панель</h1>
                <AdminOptions />
            </main>
        </div>
    );
}
