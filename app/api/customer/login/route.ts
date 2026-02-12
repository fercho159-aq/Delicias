import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createCustomerSession, setCustomerSessionCookie } from '@/lib/auth';
import { isValidEmail } from '@/lib/validation';
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
        const { email, password } = body;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'Email no válido.' }, { status: 400 });
        }
        if (!password) {
            return NextResponse.json({ error: 'La contraseña es requerida.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: 'Email o contraseña incorrectos.' },
                { status: 401 }
            );
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: 'Email o contraseña incorrectos.' },
                { status: 401 }
            );
        }

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
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error al iniciar sesión.' }, { status: 500 });
    }
}
