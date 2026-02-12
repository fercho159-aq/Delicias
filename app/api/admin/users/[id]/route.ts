import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString, isValidEmail } from '@/lib/validation';

const VALID_ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];

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
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: { select: { orders: true } },
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        total: true,
                        createdAt: true,
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ ...user, passwordHash: undefined });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const body = await request.json();
        const updateData: Record<string, unknown> = {};

        if (body.firstName !== undefined) {
            updateData.firstName = sanitizeString(body.firstName) || null;
        }
        if (body.lastName !== undefined) {
            updateData.lastName = sanitizeString(body.lastName) || null;
        }
        if (body.phone !== undefined) {
            updateData.phone = sanitizeString(body.phone) || null;
        }
        if (body.email !== undefined) {
            const email = body.email.trim().toLowerCase();
            if (!isValidEmail(email)) {
                return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
            }
            if (email !== existing.email) {
                const emailExists = await prisma.user.findUnique({ where: { email } });
                if (emailExists) {
                    return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 });
                }
            }
            updateData.email = email;
        }
        if (body.role !== undefined) {
            if (!VALID_ROLES.includes(body.role)) {
                return NextResponse.json(
                    { error: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}` },
                    { status: 400 }
                );
            }
            updateData.role = body.role;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No se proporcionaron campos para actualizar' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({ ...user, passwordHash: undefined });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Solo SUPER_ADMIN puede eliminar usuarios' }, { status: 403 });
        }

        const { id } = await params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        if (userId === session.userId) {
            return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
