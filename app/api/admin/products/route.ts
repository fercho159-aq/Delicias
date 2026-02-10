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
                { error: 'El nombre del producto es requerido' },
                { status: 400 }
            );
        }

        const slug = body.slug ? sanitizeString(body.slug) : generateSlug(name);
        const description = body.description ? sanitizeString(body.description) : null;
        const categoryId = body.categoryId ? Number(body.categoryId) : null;
        const status = body.status || 'ACTIVE';
        const featured = Boolean(body.featured);
        const type = body.type || 'SIMPLE';

        // Validate status and type enums
        if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
            return NextResponse.json(
                { error: 'Estado de producto inválido' },
                { status: 400 }
            );
        }

        if (!['SIMPLE', 'VARIABLE'].includes(type)) {
            return NextResponse.json(
                { error: 'Tipo de producto inválido' },
                { status: 400 }
            );
        }

        // Check slug uniqueness
        const existingProduct = await prisma.product.findUnique({
            where: { slug },
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: 'Ya existe un producto con ese slug' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                categoryId,
                status,
                featured,
                type,
                variants: {
                    create: (body.variants || []).map((v: { name: string; price: number; salePrice?: number; weight?: string; stock?: number }, i: number) => ({
                        name: sanitizeString(v.name),
                        price: v.price,
                        salePrice: v.salePrice ?? null,
                        weight: v.weight ? sanitizeString(v.weight) : null,
                        stock: v.stock ?? 0,
                        position: i,
                    })),
                },
                images: {
                    create: (body.images || []).map((img: { url: string; alt?: string }, i: number) => ({
                        url: sanitizeString(img.url),
                        alt: img.alt ? sanitizeString(img.alt) : null,
                        position: i,
                    })),
                },
            },
            include: {
                category: true,
                variants: true,
                images: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error al crear producto:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
