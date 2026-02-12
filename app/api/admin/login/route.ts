import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const loginLimiter = rateLimit({ limit: 5, windowMs: 60 * 1000 }); // 5 attempts per minute

export async function POST(request: NextRequest) {
    try {
        // Rate limit login attempts by IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') || 'unknown';
        const { success, remaining } = loginLimiter.check(ip);
        if (!success) {
            return NextResponse.json(
                { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en un minuto.' },
                { status: 429, headers: { 'Retry-After': '60' } }
            );
        }

        const { email, password } = await request.json();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Correo electrónico inválido' },
                { status: 400 }
            );
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }

        const sanitizedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'No tienes permisos de administrador' },
                { status: 403 }
            );
        }

        // Verify password
        if (!user.passwordHash) {
            return NextResponse.json(
                { error: 'Cuenta sin contraseña configurada' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Create session token
        const token = await createSession({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
