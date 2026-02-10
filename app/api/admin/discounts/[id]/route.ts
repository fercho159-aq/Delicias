import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

const VALID_DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'];

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
        const discountId = Number(id);

        if (isNaN(discountId)) {
            return NextResponse.json(
                { error: 'ID de descuento inválido' },
                { status: 400 }
            );
        }

        const discount = await prisma.discount.findUnique({
            where: { id: discountId },
        });

        if (!discount) {
            return NextResponse.json(
                { error: 'Descuento no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(discount);
    } catch (error) {
        console.error('Error al obtener descuento:', error);
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
        const discountId = Number(id);

        if (isNaN(discountId)) {
            return NextResponse.json(
                { error: 'ID de descuento inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.discount.findUnique({
            where: { id: discountId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Descuento no encontrado' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        if (body.code !== undefined) {
            const code = sanitizeString(body.code).toUpperCase();
            if (!code) {
                return NextResponse.json(
                    { error: 'El código de descuento es requerido' },
                    { status: 400 }
                );
            }
            // Check code uniqueness if changed
            if (code !== existing.code) {
                const codeExists = await prisma.discount.findUnique({
                    where: { code },
                });
                if (codeExists) {
                    return NextResponse.json(
                        { error: 'Ya existe un descuento con ese código' },
                        { status: 400 }
                    );
                }
            }
            updateData.code = code;
        }

        if (body.type !== undefined) {
            if (!VALID_DISCOUNT_TYPES.includes(body.type)) {
                return NextResponse.json(
                    { error: `Tipo de descuento inválido. Valores permitidos: ${VALID_DISCOUNT_TYPES.join(', ')}` },
                    { status: 400 }
                );
            }
            updateData.type = body.type;
        }

        if (body.value !== undefined) {
            updateData.value = body.value;
        }
        if (body.minPurchase !== undefined) {
            updateData.minPurchase = body.minPurchase ?? null;
        }
        if (body.maxUses !== undefined) {
            updateData.maxUses = body.maxUses ? Number(body.maxUses) : null;
        }
        if (body.startDate !== undefined) {
            updateData.startDate = body.startDate ? new Date(body.startDate) : null;
        }
        if (body.endDate !== undefined) {
            updateData.endDate = body.endDate ? new Date(body.endDate) : null;
        }
        if (body.active !== undefined) {
            updateData.active = Boolean(body.active);
        }

        const discount = await prisma.discount.update({
            where: { id: discountId },
            data: updateData,
        });

        return NextResponse.json(discount);
    } catch (error) {
        console.error('Error al actualizar descuento:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const discountId = Number(id);

        if (isNaN(discountId)) {
            return NextResponse.json(
                { error: 'ID de descuento inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.discount.findUnique({
            where: { id: discountId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Descuento no encontrado' },
                { status: 404 }
            );
        }

        await prisma.discount.delete({
            where: { id: discountId },
        });

        return NextResponse.json({ message: 'Descuento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar descuento:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
