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
        const productId = Number(id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'ID de producto inválido' },
                { status: 400 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' } },
                variants: { orderBy: { position: 'asc' } },
                attributes: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error al obtener producto:', error);
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
        const productId = Number(id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'ID de producto inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        if (body.name !== undefined) {
            updateData.name = sanitizeString(body.name);
        }
        if (body.slug !== undefined) {
            updateData.slug = sanitizeString(body.slug);
        } else if (body.name !== undefined) {
            updateData.slug = generateSlug(sanitizeString(body.name));
        }
        if (body.description !== undefined) {
            updateData.description = body.description ? sanitizeString(body.description) : null;
        }
        if (body.categoryId !== undefined) {
            updateData.categoryId = body.categoryId ? Number(body.categoryId) : null;
        }
        if (body.status !== undefined) {
            if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(body.status)) {
                return NextResponse.json(
                    { error: 'Estado de producto inválido' },
                    { status: 400 }
                );
            }
            updateData.status = body.status;
        }
        if (body.featured !== undefined) {
            updateData.featured = Boolean(body.featured);
        }
        if (body.type !== undefined) {
            if (!['SIMPLE', 'VARIABLE'].includes(body.type)) {
                return NextResponse.json(
                    { error: 'Tipo de producto inválido' },
                    { status: 400 }
                );
            }
            updateData.type = body.type;
        }

        // Check slug uniqueness if slug changed
        if (updateData.slug && updateData.slug !== existing.slug) {
            const slugExists = await prisma.product.findUnique({
                where: { slug: updateData.slug as string },
            });
            if (slugExists) {
                return NextResponse.json(
                    { error: 'Ya existe un producto con ese slug' },
                    { status: 400 }
                );
            }
        }

        // Use transaction to update product, variants, and images
        const product = await prisma.$transaction(async (tx) => {
            // Delete and recreate variants if provided
            if (body.variants !== undefined) {
                await tx.productVariant.deleteMany({
                    where: { productId },
                });
                await tx.productVariant.createMany({
                    data: (body.variants || []).map((v: { name: string; price: number; salePrice?: number; weight?: string; stock?: number }, i: number) => ({
                        productId,
                        name: sanitizeString(v.name),
                        price: v.price,
                        salePrice: v.salePrice ?? null,
                        weight: v.weight ? sanitizeString(v.weight) : null,
                        stock: v.stock ?? 0,
                        position: i,
                    })),
                });
            }

            // Delete and recreate images if provided
            if (body.images !== undefined) {
                await tx.productImage.deleteMany({
                    where: { productId },
                });
                await tx.productImage.createMany({
                    data: (body.images || []).map((img: { url: string; alt?: string }, i: number) => ({
                        productId,
                        url: sanitizeString(img.url),
                        alt: img.alt ? sanitizeString(img.alt) : null,
                        position: i,
                    })),
                });
            }

            // Update product fields
            return tx.product.update({
                where: { id: productId },
                data: updateData,
                include: {
                    category: true,
                    variants: { orderBy: { position: 'asc' } },
                    images: { orderBy: { position: 'asc' } },
                    attributes: true,
                },
            });
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
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
        const productId = Number(id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'ID de producto inválido' },
                { status: 400 }
            );
        }

        const existing = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        await prisma.product.delete({
            where: { id: productId },
        });

        return NextResponse.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
