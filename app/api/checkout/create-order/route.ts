import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from '@/lib/email';
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
    paymentMethod: 'whatsapp' | 'transfer';
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutBody = await request.json();

        // --- Input validation ---
        const errors: string[] = [];

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
        if (!sanitizeString(body.shipping?.address)) {
            errors.push('La dirección de envío es requerida.');
        }
        if (!sanitizeString(body.shipping?.city)) {
            errors.push('La ciudad es requerida.');
        }
        if (!body.shipping?.zipCode || !isValidZipCode(body.shipping.zipCode)) {
            errors.push('El código postal no es válido.');
        }
        if (!isPositiveNumber(body.subtotal)) {
            errors.push('El subtotal debe ser un número positivo.');
        }
        if (!isPositiveNumber(body.total)) {
            errors.push('El total debe ser un número positivo.');
        }

        if (errors.length > 0) {
            return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
        }

        // Sanitize inputs
        body.customer.firstName = sanitizeString(body.customer.firstName);
        body.customer.lastName = sanitizeString(body.customer.lastName);
        body.customer.email = body.customer.email.trim().toLowerCase();
        body.customer.phone = sanitizeString(body.customer.phone);
        body.shipping.address = sanitizeString(body.shipping.address);
        body.shipping.city = sanitizeString(body.shipping.city);
        body.shipping.state = sanitizeString(body.shipping.state);
        body.shipping.zipCode = body.shipping.zipCode.trim();
        body.notes = sanitizeString(body.notes);

        // Recalculate total server-side
        const recalculatedSubtotal = body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Validate and apply discount if provided
        let serverDiscountAmount = 0;
        let validatedDiscount: { id: number; code: string; type: string; value: number } | null = null;

        if (body.discountCode) {
            const discount = await prisma.discount.findFirst({
                where: {
                    code: { equals: body.discountCode.trim(), mode: 'insensitive' },
                },
            });

            if (!discount || !discount.active) {
                return NextResponse.json({ error: 'El código de descuento no es válido.' }, { status: 400 });
            }

            const now = new Date();
            if ((discount.startDate && now < discount.startDate) || (discount.endDate && now > discount.endDate)) {
                return NextResponse.json({ error: 'El código de descuento no está vigente.' }, { status: 400 });
            }
            if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
                return NextResponse.json({ error: 'El código de descuento ha alcanzado su límite.' }, { status: 400 });
            }

            const minPurchase = discount.minPurchase ? Number(discount.minPurchase) : 0;
            if (minPurchase > 0 && recalculatedSubtotal < minPurchase) {
                return NextResponse.json(
                    { error: `El pedido mínimo para este código es de $${minPurchase.toLocaleString('es-MX')} MXN.` },
                    { status: 400 }
                );
            }

            const discountValue = Number(discount.value);
            validatedDiscount = { id: discount.id, code: discount.code, type: discount.type, value: discountValue };

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

        if (Math.abs(recalculatedTotal - body.total) > 0.01) {
            return NextResponse.json(
                { error: 'El total calculado no coincide. Por favor, recarga la página.' },
                { status: 400 }
            );
        }

        body.subtotal = recalculatedSubtotal;
        body.total = recalculatedTotal;

        // Generate order number
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        const orderNumber = `DEL-${timestamp}-${random}`;

        // Check if authenticated customer
        const session = await getCustomerSession();

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: body.customer.email },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: body.customer.email,
                    firstName: body.customer.firstName,
                    lastName: body.customer.lastName,
                    phone: body.customer.phone,
                },
            });
        }

        // Use authenticated user ID if session matches email
        const userId = session && session.email === body.customer.email
            ? session.userId
            : user.id;

        // Create address
        const address = await prisma.address.create({
            data: {
                userId,
                type: 'SHIPPING',
                firstName: body.customer.firstName,
                lastName: body.customer.lastName,
                street: body.shipping.address,
                city: body.shipping.city,
                state: body.shipping.state,
                postalCode: body.shipping.zipCode,
                phone: body.customer.phone,
            },
        });

        // Create order
        const paymentMethod = body.paymentMethod || 'whatsapp';
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId,
                addressId: address.id,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                paymentMethod,
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
                    })),
                },
            },
        });

        // Increment discount usage
        if (validatedDiscount) {
            await prisma.discount.update({
                where: { id: validatedDiscount.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        // Send confirmation emails (fire-and-forget, don't block the response)
        const emailData = {
            orderNumber: order.orderNumber,
            customerEmail: body.customer.email,
            customerName: `${body.customer.firstName} ${body.customer.lastName}`,
            customerPhone: body.customer.phone,
            paymentMethod,
            items: body.items.map(item => ({
                name: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            })),
            subtotal: body.subtotal,
            shippingCost: body.shippingCost,
            discount: serverDiscountAmount,
            total: body.total,
            shippingAddress: {
                street: body.shipping.address,
                city: body.shipping.city,
                state: body.shipping.state,
                postalCode: body.shipping.zipCode,
            },
            notes: body.notes || undefined,
        };

        Promise.all([
            sendOrderConfirmationEmail(emailData),
            sendOrderNotificationEmail(emailData),
        ]).catch(err => console.error('Error sending order emails:', err));

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Error al crear el pedido.' }, { status: 500 });
    }
}
