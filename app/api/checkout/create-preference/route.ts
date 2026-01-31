import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { preference } from '@/lib/mercadopago';

interface CheckoutItem {
    variantId: number;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    image: string | null;
}

interface CheckoutBody {
    items: CheckoutItem[];
    customer: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    shipping: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
    };
    notes: string;
    subtotal: number;
    shippingCost: number;
    total: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutBody = await request.json();

        if (!body.items?.length || !body.customer?.email || !body.shipping?.address) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Generate order number
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        const orderNumber = `DEL-${timestamp}-${random}`;

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: body.customer.email }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: body.customer.email,
                    firstName: body.customer.firstName,
                    lastName: body.customer.lastName,
                    phone: body.customer.phone,
                }
            });
        }

        // Create address
        const address = await prisma.address.create({
            data: {
                userId: user.id,
                type: 'SHIPPING',
                firstName: body.customer.firstName,
                lastName: body.customer.lastName,
                street: body.shipping.address,
                city: body.shipping.city,
                state: body.shipping.state,
                postalCode: body.shipping.zipCode,
                phone: body.customer.phone,
            }
        });

        // Create order in DB with PENDING status
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                addressId: address.id,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                paymentMethod: 'mercadopago',
                subtotal: body.subtotal,
                shippingCost: body.shippingCost,
                total: body.total,
                notes: body.notes || null,
                items: {
                    create: body.items.map(item => ({
                        variantId: item.variantId,
                        name: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`,
                        price: item.price,
                        quantity: item.quantity,
                        total: item.price * item.quantity,
                    }))
                }
            }
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Create Mercado Pago preference
        const mpPreference = await preference.create({
            body: {
                items: body.items.map(item => ({
                    id: String(item.variantId),
                    title: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`,
                    quantity: item.quantity,
                    unit_price: item.price,
                    currency_id: 'MXN',
                })),
                payer: {
                    email: body.customer.email,
                    name: body.customer.firstName,
                    surname: body.customer.lastName,
                    phone: {
                        number: body.customer.phone,
                    },
                },
                back_urls: {
                    success: `${siteUrl}/checkout/resultado?status=success`,
                    failure: `${siteUrl}/checkout/resultado?status=failure`,
                    pending: `${siteUrl}/checkout/resultado?status=pending`,
                },
                auto_return: 'approved',
                notification_url: `${siteUrl}/api/webhooks/mercadopago`,
                external_reference: orderNumber,
                statement_descriptor: 'DELICIAS CAMPO',
            }
        });

        // Save MP preference ID to order
        await prisma.order.update({
            where: { id: order.id },
            data: { mpPreferenceId: mpPreference.id }
        });

        return NextResponse.json({
            success: true,
            orderNumber,
            initPoint: mpPreference.init_point,
            sandboxInitPoint: mpPreference.sandbox_init_point,
        });

    } catch (error) {
        console.error('Error creating checkout preference:', error);
        return NextResponse.json(
            { error: 'Error al crear la preferencia de pago' },
            { status: 500 }
        );
    }
}
