'use client'

import { useEffect, useState } from 'react'

export default function FavoriteButton({ mangaId }) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`/api/mangas/${mangaId}/favourites`, {
                    method: 'GET'
                })
                const data = await res.json()
                setIsFavorite(data.isFavorite)
            } catch (err) {
                console.error('Failed to check favorite:', err)
            } finally {
                setLoading(false)
            }
        }
        check()
    }, [mangaId])

    const toggleFavorite = async () => {
        setLoading(true)
        try {
            const method = isFavorite ? 'DELETE' : 'POST'
            const res = await fetch(`/api/mangas/${mangaId}/favourites`, {
                method,
            })

            if (res.ok) setIsFavorite(!isFavorite)
        } catch (err) {
            console.error('Failed to toggle favorite:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`px-4 py-2 rounded-full transition w-40 cursor-pointer ${isFavorite
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white hover:bg-gray-300 text-black'
                }`}
        >
            {loading ? '...' : isFavorite ? 'У вибраному' : 'Додати в обране'}
        </button>
    )
}
