import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
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
        const name = sanitizeString(body.name);

        if (!name) {
            return NextResponse.json(
                { error: 'El nombre de la categoría es requerido' },
                { status: 400 }
            );
        }

        const slug = body.slug ? sanitizeString(body.slug) : generateSlug(name);
        const description = body.description ? sanitizeString(body.description) : null;
        const image = body.image ? sanitizeString(body.image) : null;
        const parentId = body.parentId ? Number(body.parentId) : null;

        // Check slug uniqueness
        const existingCategory = await prisma.category.findUnique({
            where: { slug },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Ya existe una categoría con ese slug' },
                { status: 400 }
            );
        }

        // Check name uniqueness
        const existingName = await prisma.category.findUnique({
            where: { name },
        });

        if (existingName) {
            return NextResponse.json(
                { error: 'Ya existe una categoría con ese nombre' },
                { status: 400 }
            );
        }

        // Validate parentId exists if provided
        if (parentId) {
            const parentCategory = await prisma.category.findUnique({
                where: { id: parentId },
            });
            if (!parentCategory) {
                return NextResponse.json(
                    { error: 'La categoría padre no existe' },
                    { status: 400 }
                );
            }
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                image,
                parentId,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
