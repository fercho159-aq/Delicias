import { prisma } from '@/lib/prisma';
import { ProductCard, ProductGrid } from '@/components/ProductCard';
import Link from 'next/link';
import { Filter, ChevronRight } from 'lucide-react';
import '../../productos/productos.css'; // Reusing styles

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;

    // Capitalize first letter
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: title.replace(/-/g, ' '),
        description: `Explora nuestra selección de ${category.replace(/-/g, ' ')} de la más alta calidad. Envíos a todo México.`,
    };
}

async function getProducts(categorySlug: string) {
    try {
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
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category: categorySlug } = await params;

    const [products, categories] = await Promise.all([
        getProducts(categorySlug),
        getCategories()
    ]);

    const activeCategory = categories.find((c: any) => c.slug === categorySlug);
    const categoryName = activeCategory ? activeCategory.name : categorySlug;

    return (
        <div className="productos-page">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link href="/">Inicio</Link>
                <ChevronRight size={14} />
                <Link href="/productos">Tienda</Link>
                <ChevronRight size={14} />
                <span>{categoryName}</span>
            </nav>

            <div className="page-header">
                <h1>{categoryName}</h1>
                <p className="products-count">
                    {products.length} productos
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
                            className="category-link"
                        >
                            Todos los Productos
                            <span className="count">{categories.reduce((acc: number, c: any) => acc + c._count.products, 0)}</span>
                        </Link>

                        {categories.map((category: any) => (
                            <Link
                                key={category.id}
                                href={`/tienda/${category.slug}`}
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
