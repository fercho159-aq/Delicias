import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                items: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
