import { getUserFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
    const user = await getUserFromRequest(req)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Отримуємо всі улюблені з датою останнього перегляду (favUpdatedAt) та датою оновлення манґи
        const favorites = await prisma.favorite.findMany({
            where: {
                userId: user.id,
            },
            include: {
                manga: {
                    select: {
                        updatedAt: true,
                    },
                },
            },
        })

        // Фільтруємо ті, де манга була оновлена після останнього перегляду
        const updatedFavourites = favorites.filter(fav => {
            return fav.manga.updatedAt.getTime() > fav.updatedAt.getTime()
        })

        return NextResponse.json({ updatedCount: updatedFavourites.length })
    } catch (err) {
        console.error('[GET /api/profile/favourites/updatecount]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
