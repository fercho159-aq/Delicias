import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createCustomerSession, setCustomerSessionCookie } from '@/lib/auth';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ limit: 5, windowMs: 60 * 1000 });

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = limiter.check(ip);
    if (!success) {
        return NextResponse.json(
            { error: 'Demasiados intentos. Espera un momento.' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { email, password, firstName, lastName, phone } = body;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'Email no válido.' }, { status: 400 });
        }
        if (!password || password.length < 8) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
        }
        if (!firstName?.trim()) {
            return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
        }
        if (!lastName?.trim()) {
            return NextResponse.json({ error: 'El apellido es requerido.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            if (existingUser.passwordHash) {
                return NextResponse.json(
                    { error: 'Ya existe una cuenta con este email. Inicia sesión.' },
                    { status: 409 }
                );
            }

            // User exists without password (from checkout) — set password
            const passwordHash = await hashPassword(password);
            const user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    passwordHash,
                    firstName: sanitizeString(firstName),
                    lastName: sanitizeString(lastName),
                    phone: phone ? sanitizeString(phone) : existingUser.phone,
                },
            });

            const token = await createCustomerSession({ id: user.id, email: user.email });
            await setCustomerSessionCookie(token);

            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                },
            });
        }

        // New user
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                firstName: sanitizeString(firstName),
                lastName: sanitizeString(lastName),
                phone: phone ? sanitizeString(phone) : null,
            },
        });

        const token = await createCustomerSession({ id: user.id, email: user.email });
        await setCustomerSessionCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Error al registrar.' }, { status: 500 });
    }
}
