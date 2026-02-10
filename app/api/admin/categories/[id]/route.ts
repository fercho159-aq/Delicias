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
        const categoryId = Number(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: 'ID de categoría inválido' },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Categoría no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error al obtener categoría:', error);
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
        const categoryId = Number(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: 'ID de categoría inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Categoría no encontrada' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        if (body.name !== undefined) {
            const name = sanitizeString(body.name);
            if (!name) {
                return NextResponse.json(
                    { error: 'El nombre de la categoría es requerido' },
                    { status: 400 }
                );
            }
            // Check name uniqueness
            if (name !== existing.name) {
                const nameExists = await prisma.category.findUnique({
                    where: { name },
                });
                if (nameExists) {
                    return NextResponse.json(
                        { error: 'Ya existe una categoría con ese nombre' },
                        { status: 400 }
                    );
                }
            }
            updateData.name = name;
        }

        if (body.slug !== undefined) {
            updateData.slug = sanitizeString(body.slug);
        } else if (body.name !== undefined) {
            updateData.slug = generateSlug(sanitizeString(body.name));
        }

        if (body.description !== undefined) {
            updateData.description = body.description ? sanitizeString(body.description) : null;
        }
        if (body.image !== undefined) {
            updateData.image = body.image ? sanitizeString(body.image) : null;
        }
        if (body.parentId !== undefined) {
            updateData.parentId = body.parentId ? Number(body.parentId) : null;
        }

        // Check slug uniqueness if slug changed
        if (updateData.slug && updateData.slug !== existing.slug) {
            const slugExists = await prisma.category.findUnique({
                where: { slug: updateData.slug as string },
            });
            if (slugExists) {
                return NextResponse.json(
                    { error: 'Ya existe una categoría con ese slug' },
                    { status: 400 }
                );
            }
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: updateData,
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
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
        const categoryId = Number(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: 'ID de categoría inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: { select: { products: true } },
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Categoría no encontrada' },
                { status: 404 }
            );
        }

        if (existing._count.products > 0) {
            return NextResponse.json(
                { error: `No se puede eliminar la categoría porque tiene ${existing._count.products} producto(s) asignado(s)` },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id: categoryId },
        });

        return NextResponse.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
