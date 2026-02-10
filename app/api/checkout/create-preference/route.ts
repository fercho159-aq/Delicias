import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { preference } from '@/lib/mercadopago';
import {
    sanitizeString,
    isValidEmail,
    isValidPhone,
    isValidZipCode,
    isPositiveNumber,
    isPositiveInteger,
} from '@/lib/validation';

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
    discountCode?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutBody = await request.json();

        // --- Input validation ---
        const errors: string[] = [];

        // Validate items array
        if (!Array.isArray(body.items) || body.items.length === 0) {
            errors.push('El carrito no puede estar vacío.');
        } else {
            for (let i = 0; i < body.items.length; i++) {
                const item = body.items[i];
                if (!isPositiveNumber(item.price)) {
                    errors.push(`El precio del producto #${i + 1} debe ser un número positivo.`);
                }
                if (!isPositiveInteger(item.quantity)) {
                    errors.push(`La cantidad del producto #${i + 1} debe ser un número entero positivo.`);
                }
                if (!isPositiveInteger(item.variantId)) {
                    errors.push(`El identificador de variante del producto #${i + 1} es inválido.`);
                }
            }
        }

        // Validate customer fields
        if (!body.customer?.email || !isValidEmail(body.customer.email)) {
            errors.push('El correo electrónico no es válido.');
        }
        if (!body.customer?.phone || !isValidPhone(body.customer.phone)) {
            errors.push('El número de teléfono no es válido.');
        }
        if (!sanitizeString(body.customer?.firstName)) {
            errors.push('El nombre es requerido.');
        }
        if (!sanitizeString(body.customer?.lastName)) {
            errors.push('El apellido es requerido.');
        }

        // Validate shipping fields
        if (!sanitizeString(body.shipping?.address)) {
            errors.push('La dirección de envío es requerida.');
        }
        if (!sanitizeString(body.shipping?.city)) {
            errors.push('La ciudad es requerida.');
        }
        if (!body.shipping?.zipCode || !isValidZipCode(body.shipping.zipCode)) {
            errors.push('El código postal no es válido (debe tener entre 4 y 6 dígitos).');
        }

        // Validate totals
        if (!isPositiveNumber(body.subtotal)) {
            errors.push('El subtotal debe ser un número positivo.');
        }
        if (!isPositiveNumber(body.total)) {
            errors.push('El total debe ser un número positivo.');
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(' ') },
                { status: 400 }
            );
        }

        // Sanitize all string inputs
        body.customer.firstName = sanitizeString(body.customer.firstName);
        body.customer.lastName = sanitizeString(body.customer.lastName);
        body.customer.email = body.customer.email.trim().toLowerCase();
        body.customer.phone = sanitizeString(body.customer.phone);
        body.shipping.address = sanitizeString(body.shipping.address);
        body.shipping.city = sanitizeString(body.shipping.city);
        body.shipping.state = sanitizeString(body.shipping.state);
        body.shipping.zipCode = body.shipping.zipCode.trim();
        body.notes = sanitizeString(body.notes);

        // Recalculate total server-side to prevent price manipulation
        const recalculatedSubtotal = body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Validate and apply discount if provided
        let serverDiscountAmount = 0;
        let validatedDiscount: {
            id: number;
            code: string;
            type: string;
            value: number;
        } | null = null;

        if (body.discountCode) {
            const discount = await prisma.discount.findFirst({
                where: {
                    code: {
                        equals: body.discountCode.trim(),
                        mode: 'insensitive',
                    },
                },
            });

            if (!discount) {
                return NextResponse.json(
                    { error: 'El código de descuento no existe.' },
                    { status: 400 }
                );
            }

            if (!discount.active) {
                return NextResponse.json(
                    { error: 'Este código de descuento ya no está activo.' },
                    { status: 400 }
                );
            }

            const now = new Date();
            if (discount.startDate && now < discount.startDate) {
                return NextResponse.json(
                    { error: 'Este código de descuento aún no está vigente.' },
                    { status: 400 }
                );
            }

            if (discount.endDate && now > discount.endDate) {
                return NextResponse.json(
                    { error: 'Este código de descuento ha expirado.' },
                    { status: 400 }
                );
            }

            if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
                return NextResponse.json(
                    { error: 'Este código de descuento ha alcanzado su límite de usos.' },
                    { status: 400 }
                );
            }

            const minPurchase = discount.minPurchase ? Number(discount.minPurchase) : 0;
            if (minPurchase > 0 && recalculatedSubtotal < minPurchase) {
                return NextResponse.json(
                    { error: `El pedido mínimo para este código es de $${minPurchase.toLocaleString('es-MX')} MXN.` },
                    { status: 400 }
                );
            }

            const discountValue = Number(discount.value);
            validatedDiscount = {
                id: discount.id,
                code: discount.code,
                type: discount.type,
                value: discountValue,
            };

            switch (discount.type) {
                case 'PERCENTAGE':
                    serverDiscountAmount = Math.round((recalculatedSubtotal * discountValue) / 100 * 100) / 100;
                    break;
                case 'FIXED':
                    serverDiscountAmount = Math.min(discountValue, recalculatedSubtotal);
                    break;
                case 'FREE_SHIPPING':
                    serverDiscountAmount = body.shippingCost || 0;
                    break;
            }
        }

        const recalculatedTotal = recalculatedSubtotal + (body.shippingCost || 0) - serverDiscountAmount;

        // Allow a small floating-point tolerance (1 cent)
        if (Math.abs(recalculatedTotal - body.total) > 0.01) {
            return NextResponse.json(
                { error: 'El total calculado no coincide. Por favor, recarga la página e intenta de nuevo.' },
                { status: 400 }
            );
        }

        // Use server-recalculated values
        body.subtotal = recalculatedSubtotal;
        body.total = recalculatedTotal;

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
                discount: serverDiscountAmount,
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

        // Increment usedCount on the Discount record
        if (validatedDiscount) {
            await prisma.discount.update({
                where: { id: validatedDiscount.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Build Mercado Pago items list
        const mpItems: Array<{
            id: string;
            title: string;
            quantity: number;
            unit_price: number;
            currency_id: string;
        }> = body.items.map(item => ({
            id: String(item.variantId),
            title: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: 'MXN',
        }));

        // Add discount as a negative line item if applicable
        if (validatedDiscount && serverDiscountAmount > 0) {
            mpItems.push({
                id: `discount-${validatedDiscount.code}`,
                title: `Descuento (${validatedDiscount.code})`,
                quantity: 1,
                unit_price: -serverDiscountAmount,
                currency_id: 'MXN',
            });
        }

        // Create Mercado Pago preference
        const mpPreference = await preference.create({
            body: {
                items: mpItems,
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
