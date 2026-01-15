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
    return prisma.product.findMany({
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
}

// Get latest products
export async function getLatestProducts(limit = 12) {
    return prisma.product.findMany({
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
}

// Get products by category
export async function getProductsByCategory(categorySlug: string, limit = 20) {
    return prisma.product.findMany({
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
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
    return prisma.product.findUnique({
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

    return {
        products,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
}

// Search products
export async function searchProducts(query: string, limit = 20) {
    return prisma.product.findMany({
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
}
