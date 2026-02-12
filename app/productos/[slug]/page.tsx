import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailView from './ProductDetailView';

// Revalidate page every hour
export const revalidate = 3600;

interface PageProps {
    params: {
        slug: string;
    }
}

async function getProduct(slug: string) {
    // Extract base slug if it contains ID (our slugs are name-id format usually)
    // Actually, we store the full slug in DB so we search by that

    // Attempt specific search 
    const product = await prisma.product.findFirst({
        where: {
            slug: slug,
            status: 'ACTIVE'
        },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' }
            },
            variants: {
                where: { inStock: true }, // Only show in-stock variants or handle in UI
                orderBy: { price: 'asc' }
            }
        }
    });

    if (!product) return null;

    // Serialize Decimals to Numbers
    return {
        ...product,
        variants: product.variants.map((v: any) => ({
            ...v,
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null
        }))
    };
}

async function getRelatedProducts(categoryId: number | null, currentProductId: number) {
    if (!categoryId) return [];

    const related = await prisma.product.findMany({
        where: {
            categoryId: categoryId,
            id: { not: currentProductId },
            status: 'ACTIVE',
            type: 'VARIABLE'
        },
        take: 4,
        include: {
            category: true,
            images: { take: 1 },
            variants: {
                take: 1,
                orderBy: { price: 'asc' }
            }
        }
    });

    return related.map((p: any) => ({
        ...p,
        variants: p.variants.map((v: any) => ({
            ...v,
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null
        }))
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
        where: { slug },
        select: { name: true, description: true }
    });

    if (!product) return { title: 'Producto no encontrado' };

    return {
        title: product.name,
        description: product.description?.substring(0, 160) || `Compra ${product.name} de la más alta calidad. Envíos a todo México.`,
    };
}

export default async function ProductPage({ params }: PageProps) {
    // Await params correctly in Next.js 15+
    const { slug } = await params;

    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

    return (
        <main>
            <ProductDetailView product={product} relatedProducts={relatedProducts} />
        </main>
    );
}
