import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getCustomerSession();
        if (!session) {
            return NextResponse.json({ user: null });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: {
                            include: {
                                variant: {
                                    include: {
                                        product: {
                                            include: {
                                                images: {
                                                    take: 1,
                                                    orderBy: { position: 'asc' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        shippingAddress: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                hasPassword: !!user.passwordHash,
                createdAt: user.createdAt.toISOString(),
                orders: user.orders.map(order => ({
                    id: order.orderNumber,
                    date: order.createdAt.toISOString(),
                    status: order.status.toLowerCase(),
                    paymentStatus: order.paymentStatus.toLowerCase(),
                    paymentMethod: order.paymentMethod,
                    items: order.items.map(item => ({
                        productName: item.name.split(' - ')[0],
                        variantName: item.name.includes(' - ') ? item.name.split(' - ').slice(1).join(' - ') : '',
                        quantity: item.quantity,
                        price: Number(item.price),
                        image: item.variant?.product?.images?.[0]?.url || null,
                    })),
                    shipping: Number(order.shippingCost),
                    discount: Number(order.discount),
                    total: Number(order.total),
                    shippingAddress: order.shippingAddress ? {
                        address: order.shippingAddress.street,
                        city: order.shippingAddress.city,
                        state: order.shippingAddress.state,
                        zipCode: order.shippingAddress.postalCode,
                    } : null,
                })),
            },
        });
    } catch (error) {
        console.error('Get customer error:', error);
        return NextResponse.json({ error: 'Error al obtener perfil.' }, { status: 500 });
    }
}
