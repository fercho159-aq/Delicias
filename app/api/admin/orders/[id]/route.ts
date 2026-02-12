import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const orderId = Number(id);

        if (isNaN(orderId)) {
            return NextResponse.json(
                { error: 'ID de orden inválido' },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                },
                shippingAddress: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error al obtener orden:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const orderId = Number(id);

        if (isNaN(orderId)) {
            return NextResponse.json(
                { error: 'ID de orden inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        if (body.status !== undefined) {
            if (!VALID_ORDER_STATUSES.includes(body.status)) {
                return NextResponse.json(
                    { error: `Estado de orden inválido. Valores permitidos: ${VALID_ORDER_STATUSES.join(', ')}` },
                    { status: 400 }
                );
            }
            updateData.status = body.status;
        }

        if (body.paymentStatus !== undefined) {
            if (!VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
                return NextResponse.json(
                    { error: `Estado de pago inválido. Valores permitidos: ${VALID_PAYMENT_STATUSES.join(', ')}` },
                    { status: 400 }
                );
            }
            updateData.paymentStatus = body.paymentStatus;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No se proporcionaron campos para actualizar' },
                { status: 400 }
            );
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                items: {
                    include: { variant: true }
                },
                shippingAddress: true,
            },
        });

        // Restore inventory when order is cancelled (if previously paid/confirmed)
        if (body.status === 'CANCELLED' && existing.status !== 'CANCELLED' && existing.paymentStatus === 'PAID') {
            try {
                await prisma.$transaction(
                    order.items.map((item: any) =>
                        prisma.productVariant.update({
                            where: { id: item.variantId },
                            data: {
                                stock: { increment: item.quantity },
                                inStock: true,
                            },
                        })
                    )
                );
                console.log(`Inventario restaurado para orden ${orderId}`);
            } catch (invError) {
                console.error(`Error al restaurar inventario para orden ${orderId}:`, invError);
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
