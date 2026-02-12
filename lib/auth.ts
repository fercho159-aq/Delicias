import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return new TextEncoder().encode(secret);
}

export interface AdminSession {
    userId: number;
    email: string;
    role: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function createSession(user: { id: number; email: string; role: string }): Promise<string> {
    const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getJwtSecret());

    return token;
}

export async function verifySession(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return payload as unknown as AdminSession;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) return null;

    return verifySession(token);
}

export async function requireAdmin() {
    const session = await getSession();

    if (!session) {
        redirect('/admin/login');
    }

    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
        redirect('/admin/login');
    }

    return session;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
}

// --- Customer session helpers ---

export interface CustomerSession {
    userId: number;
    email: string;
    role: string;
}

export async function createCustomerSession(user: { id: number; email: string }): Promise<string> {
    const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: 'CUSTOMER',
        type: 'customer',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getJwtSecret());

    return token;
}

export async function setCustomerSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('customer_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        if (payload.type !== 'customer') return null;
        return {
            userId: payload.userId as number,
            email: payload.email as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

export async function deleteCustomerSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('customer_session');
}
