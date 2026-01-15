import { prisma } from '@/lib/prisma';
import { ProductCard, ProductGrid } from '@/components/ProductCard';
import Link from 'next/link';
import { Filter, ChevronRight } from 'lucide-react';
import './productos.css';

export const metadata = {
    title: 'Productos | Las Delicias del Campo',
    description: 'Explora nuestra selección de nueces, semillas, frutos secos y más productos naturales de la más alta calidad.',
};

// Re-validate every hour
export const revalidate = 3600;

async function getProducts(categorySlug?: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                type: 'VARIABLE', // Only parent products
                status: 'ACTIVE',
                ...(categorySlug && {
                    category: {
                        slug: categorySlug
                    }
                })
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
            orderBy: [
                { featured: 'desc' },
                { name: 'asc' }
            ]
        });

        return products.map((product: any) => ({
            ...product,
            variants: product.variants.map((variant: any) => ({
                ...variant,
                price: Number(variant.price),
                salePrice: variant.salePrice ? Number(variant.salePrice) : null
            }))
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

interface PageProps {
    searchParams: Promise<{ categoria?: string }>;
}

export default async function ProductosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const categorySlug = params.categoria;

    const [products, categories] = await Promise.all([
        getProducts(categorySlug),
        getCategories()
    ]);

    const activeCategory = categorySlug
        ? categories.find((c: any) => c.slug === categorySlug)
        : null;

    return (
        <div className="productos-page">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link href="/">Inicio</Link>
                <ChevronRight size={14} />
                <span>Productos</span>
                {activeCategory && (
                    <>
                        <ChevronRight size={14} />
                        <span>{activeCategory.name}</span>
                    </>
                )}
            </nav>

            <div className="page-header">
                <h1>
                    {activeCategory
                        ? activeCategory.name
                        : 'Todos los Productos'}
                </h1>
                <p className="products-count">
                    {products.length} productos {activeCategory && `en ${activeCategory.name}`}
                </p>
            </div>

            <div className="productos-layout">
                {/* Sidebar con categorías */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <Filter size={18} />
                        <span>Categorías</span>
                    </div>

                    <nav className="categories-nav">
                        <Link
                            href="/productos"
                            className={`category-link ${!categorySlug ? 'active' : ''}`}
                        >
                            Todos los Productos
                            <span className="count">{categories.reduce((acc, c) => acc + c._count.products, 0)}</span>
                        </Link>

                        {categories.map((category: any) => (
                            <Link
                                key={category.id}
                                href={`/productos?categoria=${category.slug}`}
                                className={`category-link ${categorySlug === category.slug ? 'active' : ''}`}
                            >
                                {category.name}
                                <span className="count">{category._count.products}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Grid de productos */}
                <main className="products-main">
                    {products.length > 0 ? (
                        <ProductGrid>
                            {products.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </ProductGrid>
                    ) : (
                        <div className="no-products">
                            <p>No se encontraron productos en esta categoría.</p>
                            <Link href="/productos" className="btn btn-primary">
                                Ver todos los productos
                            </Link>
                        </div>
                    )}
                </main>
            </div>


        </div>
    );
}
