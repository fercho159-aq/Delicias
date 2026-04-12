import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession, hashPassword } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

export async function PUT(request: NextRequest) {
    try {
        const session = await getCustomerSession();
        if (!session) {
            return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
        }

        const body = await request.json();
        const { firstName, lastName, phone, password } = body;

        const updateData: Record<string, unknown> = {};

        if (firstName?.trim()) {
            updateData.firstName = sanitizeString(firstName);
        }
        if (lastName?.trim()) {
            updateData.lastName = sanitizeString(lastName);
        }
        if (phone !== undefined) {
            updateData.phone = phone ? sanitizeString(phone) : null;
        }
        if (password) {
            if (password.length < 8) {
                return NextResponse.json(
                    { error: 'La contraseña debe tener al menos 8 caracteres.' },
                    { status: 400 }
                );
            }
            updateData.passwordHash = await hashPassword(password);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No hay datos para actualizar.' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                hasPassword: !!user.passwordHash,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Error al actualizar perfil.' }, { status: 500 });
    }
}
