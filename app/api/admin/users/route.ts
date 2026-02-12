import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users.map(u => ({
            ...u,
            passwordHash: undefined,
        })));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
