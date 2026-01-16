import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

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
        .sign(JWT_SECRET);

    return token;
}

export async function verifySession(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
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
