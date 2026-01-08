'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProfileButton({ user }) {
    const [updateCount, setUpdateCount] = useState(0)

    useEffect(() => {
        const fetchUpdateCount = async () => {
            try {
                const res = await fetch('/api/profile/favourite/updatecount')
                const data = await res.json()
                if (res.ok) {
                    setUpdateCount(data.updatedCount)
                }
            } catch (err) {
                console.error('Failed to fetch update count:', err)
            }
        }

        if (user) {
            fetchUpdateCount()
        }
    }, [user])

    return (
        <Link
            href="/profile"
            className="flex flex-row items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 relative"
        >
            <img
                src={user?.avatar || '/default-avatar.svg'}
                alt="avatar"
                className="w-6 h-6 rounded-full"
            />
            <span>{user?.name || 'Профіль'}</span>

            {updateCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 text-white text-xs font-bold px-2 py-0.5">
                    {updateCount}
                </span>
            )}
        </Link>
    )
}
