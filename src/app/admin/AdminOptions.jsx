'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MangaManager from './mangaManager/MangaEditor';
import UserManager from './UserMangaer';
import CollectionEditor from './CollectionEditor';

export default function AdminOptions() {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState('dashboard');
    const [user, setUserState] = useState({})

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json()
                if (data) {
                    setUserState(data)
                } else {
                    setUserState(null)
                }
            } catch {
                setUserState(null)
            }
        }
        checkAuth()
    }, []);

    return (
        <div>
            {["ADMIN","AUTHOR"].includes(user.role) ? <div>
                <nav className="mb-6 space-x-4">
                    <button
                        className={`px-3 py-1 rounded-full ${activeSection === 'editManga' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                            }`}
                        onClick={() => setActiveSection('editManga')}
                    >
                        Редактор манги
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full ${activeSection === 'collectionEditor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                            }`}
                        onClick={() => setActiveSection('collectionEditor')}
                    >
                        Редактор колекцій
                    </button>

                    {user.role == "ADMIN" && <button
                        className={`px-3 py-1 rounded-full ${activeSection === 'userEditor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                            }`}
                        onClick={() => setActiveSection('userEditor')}
                    >
                        Редактор юзерів
                    </button>}
                </nav>

                <section>
                    {activeSection === 'dashboard' && <p>Оберіть розділ.</p>}
                    {activeSection === 'editManga' && <MangaManager />}
                    {activeSection === 'collectionEditor' && <CollectionEditor />}
                    {activeSection === 'userEditor' && <UserManager />}
                </section>
            </div>
                :
                <div className="text-red-500">У вас немає доступу до адмін панелі!</div>
            }
        </div>
    );
}
