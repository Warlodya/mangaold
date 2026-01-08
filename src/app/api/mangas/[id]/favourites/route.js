import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req, { params }) {
    const { id } = await params
    const mangaId = id
    const user = await getUserFromRequest(req)

    if (!user) {
        return NextResponse.json({ isFavorite: false }, { status: 401 })
    }

    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_mangaId: {
                userId: user.id,
                mangaId,
            },
        },
    })

    return NextResponse.json({ isFavorite: !!favorite })
}

export async function POST(req, { params }) {
    const { id } = await params
    const mangaId = id
    const user = await getUserFromRequest(req)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.favorite.create({
            data: {
                userId: user.id,
                mangaId,
            },
        })

        return NextResponse.json({ added: true })
    } catch (err) {
        // handle duplicate (already exists) silently
        return NextResponse.json({ error: 'Already in favorites' }, { status: 400 })
    }
}

export async function DELETE(req, { params }) {
    const mangaId = await params.id
    const user = await getUserFromRequest(req)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.favorite.delete({
            where: {
                userId_mangaId: {
                    userId: user.id,
                    mangaId,
                },
            },
        })

        return NextResponse.json({ removed: true })
    } catch (err) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
}
