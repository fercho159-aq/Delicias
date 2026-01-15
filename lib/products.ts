import prisma from '@/lib/prisma';

// Get all categories
export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
}

// Get featured products
export async function getFeaturedProducts(limit = 8) {
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
            featured: true
        },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' },
                take: 1
            },
            variants: {
                orderBy: { price: 'asc' },
                take: 1
            }
        },
        take: limit
    });

    return products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    }));
}

// Get latest products
export async function getLatestProducts(limit = 12) {
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE'
        },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' },
                take: 1
            },
            variants: {
                orderBy: { price: 'asc' },
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    return products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    }));
}

// Get products by category
export async function getProductsByCategory(categorySlug: string, limit = 20) {
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
            category: {
                slug: categorySlug
            }
        },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' },
                take: 1
            },
            variants: {
                orderBy: { price: 'asc' },
                take: 1
            }
        },
        orderBy: { position: 'asc' },
        take: limit
    });

    return products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    }));
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' }
            },
            variants: {
                orderBy: { position: 'asc' }
            },
            attributes: true
        }
    });

    if (!product) return null;

    return {
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    };
}

// Get all products with pagination
export async function getAllProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: { status: 'ACTIVE' },
            include: {
                category: true,
                images: {
                    orderBy: { position: 'asc' },
                    take: 1
                },
                variants: {
                    orderBy: { price: 'asc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit
        }),
        prisma.product.count({ where: { status: 'ACTIVE' } })
    ]);

    const serializedProducts = products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    }));

    return {
        products: serializedProducts,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
}

// Search products
export async function searchProducts(query: string, limit = 20) {
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        },
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' },
                take: 1
            },
            variants: {
                orderBy: { price: 'asc' },
                take: 1
            }
        },
        take: limit
    });

    return products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null
        }))
    }));
}
