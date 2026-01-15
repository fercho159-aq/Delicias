'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import './product-detail.css';

interface ProductVariant {
    id: number;
    price: number;
    salePrice: number | null;
    weight: string | null;
    stock: number;
    inStock: boolean;
}

interface ProductImage {
    url: string;
    alt: string | null;
}

interface ProductDetailProps {
    product: {
        id: number;
        name: string;
        description: string | null;
        sku: string | null;
        category: { name: string; slug: string } | null;
        images: ProductImage[];
        variants: ProductVariant[];
    };
    relatedProducts: any[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<number>(product.variants[0]?.id);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    const images = product.images.length > 0 ? product.images : [{ url: '/placeholder-product.png', alt: product.name }];

    // Handle price display
    const price = activeVariant?.price || 0;
    const salePrice = activeVariant?.salePrice;
    const hasDiscount = salePrice && salePrice < price;

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= (activeVariant?.stock || 100)) {
            setQuantity(newQty);
        }
    };

    return (
        <div className="product-detail-container">
            <div className="product-breadcrumb">
                <Link href="/">Inicio</Link> /{' '}
                <Link href="/productos">Productos</Link> /{' '}
                {product.category && (
                    <>
                        <Link href={`/productos?categoria=${product.category.slug}`}>{product.category.name}</Link> /{' '}
                    </>
                )}
                <span>{product.name}</span>
            </div>

            <div className="product-detail-layout">
                {/* Columna Izquierda: Galería */}
                <div className="product-gallery">
                    <div className="main-image-wrapper">
                        <Image
                            src={images[activeImageIndex].url}
                            alt={images[activeImageIndex].alt || product.name}
                            fill
                            className="main-image"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="thumbnails-grid">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumbnail ${activeImageIndex === idx ? 'active' : ''}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Información */}
                <div className="product-info-column">
                    <h1 className="product-title">{product.name}</h1>

                    <div className="product-meta">
                        {product.sku && <span className="product-sku">SKU: {product.sku}</span>}
                        <div className={`stock-status ${activeVariant?.inStock ? 'in-stock' : 'out-of-stock'}`}>
                            {activeVariant?.inStock ? (
                                <><Check size={16} /> Disponible</>
                            ) : (
                                <>Agotado</>
                            )}
                        </div>
                    </div>

                    <div className="product-price-block">
                        {hasDiscount ? (
                            <div>
                                <span className="current-price">${salePrice.toFixed(2)}</span>
                                <span className="original-price">${price.toFixed(2)}</span>
                                <span className="discount-badge">
                                    -{Math.round((1 - salePrice / price) * 100)}%
                                </span>
                            </div>
                        ) : (
                            <span className="current-price">${price.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="product-description">
                        <p>{product.description || 'Producto fresco y natural de la mejor calidad, directo del campo a tu hogar.'}</p>
                    </div>

                    {/* Selector de Variantes (Presentación) */}
                    {product.variants.length > 1 && (
                        <div className="variants-selector">
                            <span className="variant-label">Presentación:</span>
                            <div className="variants-grid">
                                {product.variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`variant-btn ${selectedVariantId === variant.id ? 'selected' : ''} ${!variant.inStock ? 'disabled' : ''}`}
                                        onClick={() => variant.inStock && setSelectedVariantId(variant.id)}
                                        disabled={!variant.inStock}
                                    >
                                        {variant.weight || 'Estándar'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Acciones de Compra */}
                    <div className="add-to-cart-block">
                        <div className="quantity-selector">
                            <button className="qty-btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                <Minus size={18} />
                            </button>
                            <input
                                type="text"
                                className="qty-input"
                                value={quantity}
                                readOnly
                            />
                            <button className="qty-btn" onClick={() => handleQuantityChange(1)}>
                                <Plus size={18} />
                            </button>
                        </div>

                        <button className="add-btn">
                            <ShoppingCart size={20} />
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Productos Relacionados */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h2 className="section-title">Productos Relacionados</h2>
                    <div className="products-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '24px'
                    }}>
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
