import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const subtotalParam = searchParams.get('subtotal');

        if (!code) {
            return NextResponse.json(
                { valid: false, message: 'El código de descuento es requerido.' },
                { status: 400 }
            );
        }

        if (!subtotalParam || isNaN(Number(subtotalParam)) || Number(subtotalParam) <= 0) {
            return NextResponse.json(
                { valid: false, message: 'El subtotal debe ser un número positivo.' },
                { status: 400 }
            );
        }

        const subtotal = Number(subtotalParam);

        // Look up discount by code (case-insensitive)
        const discount = await prisma.discount.findFirst({
            where: {
                code: {
                    equals: code.trim(),
                    mode: 'insensitive',
                },
            },
        });

        if (!discount) {
            return NextResponse.json(
                { valid: false, message: 'El código de descuento no existe.' },
                { status: 404 }
            );
        }

        // Check if active
        if (!discount.active) {
            return NextResponse.json(
                { valid: false, message: 'Este código de descuento ya no está activo.' },
                { status: 400 }
            );
        }

        // Check start date
        const now = new Date();
        if (discount.startDate && now < discount.startDate) {
            return NextResponse.json(
                { valid: false, message: 'Este código de descuento aún no está vigente.' },
                { status: 400 }
            );
        }

        // Check end date
        if (discount.endDate && now > discount.endDate) {
            return NextResponse.json(
                { valid: false, message: 'Este código de descuento ha expirado.' },
                { status: 400 }
            );
        }

        // Check max uses
        if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
            return NextResponse.json(
                { valid: false, message: 'Este código de descuento ha alcanzado su límite de usos.' },
                { status: 400 }
            );
        }

        // Check min purchase
        const minPurchase = discount.minPurchase ? Number(discount.minPurchase) : 0;
        if (minPurchase > 0 && subtotal < minPurchase) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `El pedido mínimo para este código es de $${minPurchase.toLocaleString('es-MX')} MXN.`,
                },
                { status: 400 }
            );
        }

        // Calculate discount amount based on type
        const value = Number(discount.value);
        let discountAmount = 0;
        let description = '';

        switch (discount.type) {
            case 'PERCENTAGE':
                discountAmount = Math.round((subtotal * value) / 100 * 100) / 100;
                description = `${value}% de descuento`;
                break;
            case 'FIXED':
                discountAmount = Math.min(value, subtotal);
                description = `$${value.toLocaleString('es-MX')} de descuento`;
                break;
            case 'FREE_SHIPPING':
                discountAmount = 0; // Shipping cost will be handled on the frontend
                description = 'Envío gratis';
                break;
        }

        return NextResponse.json({
            valid: true,
            discount: {
                code: discount.code,
                type: discount.type,
                value: value,
                discountAmount,
                description,
            },
        });
    } catch (error) {
        console.error('Error validating discount:', error);
        return NextResponse.json(
            { valid: false, message: 'Error al validar el código de descuento.' },
            { status: 500 }
        );
    }
}
