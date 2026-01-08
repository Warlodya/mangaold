'use client'

import { useEffect, useState } from 'react'
import MangaCard from '@/app/components/MangaCard'

export default function FavouritePage() {
    const [favourites, setFavourites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const res = await fetch('/api/profile/favourite', {
                    credentials: 'include',
                    method: "GET"
                })
                if (!res.ok) throw new Error('Не вдалося отримати дані')
                const data = await res.json()
                setFavourites(data.favourites)
            } catch (err) {
                setError('Ви не авторизовані або сталася помилка')
            } finally {
                setLoading(false)
            }
        }

        fetchFavourites()
    }, [])

    if (loading) {
        return <div className="text-center mt-10">Завантаження...</div>
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>
    }

    console.log(favourites)

    return (
        <div className="flex flex-col gap-3 items-stretch">
            <h1 className="text-2xl font-bold">Улюблені манґи</h1>
            {favourites.length != 0 ?
                <div className="flex flex-row flex-wrap gap-6 flex-wrap items-center justify-center">
                    {favourites.map((manga) => (
                        <MangaCard key={manga.id} {...manga} />
                    ))}
                </div>
                :
                <div className="text-center">У вас немає улюблених манґ.</div>}
        </div>
    )
}
