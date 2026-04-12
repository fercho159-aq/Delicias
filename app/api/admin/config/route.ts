import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const configs = await prisma.siteConfig.findMany({
            orderBy: { key: 'asc' },
        });

        return NextResponse.json(configs);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.configs || !Array.isArray(body.configs)) {
            return NextResponse.json({ error: 'Se requiere un array de configuraciones' }, { status: 400 });
        }

        const results = [];
        for (const item of body.configs) {
            if (!item.key || item.value === undefined) continue;

            const key = sanitizeString(item.key);
            const value = sanitizeString(String(item.value));

            const config = await prisma.siteConfig.upsert({
                where: { key },
                update: { value },
                create: { key, value, type: item.type || 'text' },
            });
            results.push(config);
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
