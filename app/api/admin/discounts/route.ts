import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

const VALID_DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'];

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const discounts = await prisma.discount.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(discounts);
    } catch (error) {
        console.error('Error al obtener descuentos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const code = sanitizeString(body.code);

        if (!code) {
            return NextResponse.json(
                { error: 'El código de descuento es requerido' },
                { status: 400 }
            );
        }

        if (!body.type || !VALID_DISCOUNT_TYPES.includes(body.type)) {
            return NextResponse.json(
                { error: `Tipo de descuento inválido. Valores permitidos: ${VALID_DISCOUNT_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        if (body.type !== 'FREE_SHIPPING' && (body.value === undefined || body.value === null || Number(body.value) <= 0)) {
            return NextResponse.json(
                { error: 'El valor del descuento es requerido y debe ser positivo' },
                { status: 400 }
            );
        }

        if (body.type === 'PERCENTAGE' && Number(body.value) > 100) {
            return NextResponse.json(
                { error: 'El porcentaje de descuento no puede ser mayor a 100' },
                { status: 400 }
            );
        }

        // Check code uniqueness
        const existingDiscount = await prisma.discount.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingDiscount) {
            return NextResponse.json(
                { error: 'Ya existe un descuento con ese código' },
                { status: 400 }
            );
        }

        const discount = await prisma.discount.create({
            data: {
                code: code.toUpperCase(),
                type: body.type,
                value: body.value,
                minPurchase: body.minPurchase ?? null,
                maxUses: body.maxUses ? Number(body.maxUses) : null,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                active: body.active !== undefined ? Boolean(body.active) : true,
            },
        });

        return NextResponse.json(discount, { status: 201 });
    } catch (error) {
        console.error('Error al crear descuento:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
