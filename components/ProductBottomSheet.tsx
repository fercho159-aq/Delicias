'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import './ProductBottomSheet.css';

interface Variant {
    id: number;
    price: number;
    salePrice?: number | null;
    weight?: string | null;
    stock: number;
    inStock: boolean;
}

interface ProductImage {
    url: string;
    alt?: string | null;
}

export interface BottomSheetProduct {
    id: number;
    name: string;
    slug: string;
    category?: { name: string; slug: string } | null;
    images: ProductImage[];
    variants: Variant[];
}

interface Props {
    product: BottomSheetProduct | null;
    onClose: () => void;
}

export default function ProductBottomSheet({ product, onClose }: Props) {
    const { addItem } = useCart();
    const [selectedVariantId, setSelectedVariantId] = useState<number>(0);
    const [quantity, setQuantity] = useState(1);
    const [imageIndex, setImageIndex] = useState(0);
    const [isAdded, setIsAdded] = useState(false);

    const isOpen = product !== null;

    useEffect(() => {
        if (product) {
            setSelectedVariantId(product.variants[0]?.id || 0);
            setQuantity(1);
            setImageIndex(0);
            setIsAdded(false);
        }
    }, [product]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!product) return null;

    const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    const images = product.images.length > 0 ? product.images : [{ url: '/placeholder-product.png', alt: product.name }];

    const price = activeVariant?.price || 0;
    const salePrice = activeVariant?.salePrice;
    const hasDiscount = salePrice && salePrice < price;
    const displayPrice = hasDiscount ? salePrice : price;

    const handleAdd = () => {
        if (!activeVariant?.inStock) return;
        addItem({
            variantId: activeVariant.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            variantName: activeVariant.weight || '',
            price: displayPrice,
            quantity,
            image: images[0]?.url || null,
            maxStock: activeVariant.stock,
        });
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
            onClose();
        }, 1200);
    };

    return (
        <>
            <div
                className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
                <div className="bottom-sheet-handle"><span /></div>
                <button className="bottom-sheet-close" onClick={onClose} aria-label="Cerrar">
                    <X size={18} />
                </button>

                <div className="bottom-sheet-scroll">
                    {/* Image Carousel */}
                    <div className="bs-carousel">
                        <div
                            className="bs-carousel-track"
                            style={{ transform: `translateX(-${imageIndex * 100}%)` }}
                        >
                            {images.map((img, i) => (
                                <div key={i} className="bs-carousel-slide">
                                    <Image
                                        src={img.url}
                                        alt={img.alt || product.name}
                                        fill
                                        sizes="(max-width: 480px) 100vw, 480px"
                                        style={{ objectFit: 'contain', padding: '16px' }}
                                    />
                                </div>
                            ))}
                        </div>
                        {images.length > 1 && (
                            <div className="bs-carousel-dots">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`bs-carousel-dot ${imageIndex === i ? 'active' : ''}`}
                                        onClick={() => setImageIndex(i)}
                                        aria-label={`Imagen ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    {product.category && (
                        <span className="bs-product-category">{product.category.name}</span>
                    )}
                    <h2 className="bs-product-name">{product.name}</h2>

                    {/* Price */}
                    <div className="bs-price-row">
                        <span className="bs-current-price">${displayPrice.toFixed(2)}</span>
                        {hasDiscount && (
                            <>
                                <span className="bs-original-price">${price.toFixed(2)}</span>
                                <span className="bs-discount-badge">
                                    -{Math.round((1 - salePrice / price) * 100)}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Variants */}
                    {product.variants.length > 1 && (
                        <>
                            <span className="bs-variants-label">Presentación:</span>
                            <div className="bs-variants-grid">
                                {product.variants.map(v => (
                                    <button
                                        key={v.id}
                                        className={`bs-variant-btn ${selectedVariantId === v.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedVariantId(v.id);
                                            setQuantity(1);
                                        }}
                                    >
                                        {v.weight || 'Estándar'}
                                        <span className="bs-variant-price">${(v.salePrice && v.salePrice < v.price ? v.salePrice : v.price).toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Quantity + Add to Cart */}
                    <div className="bs-actions">
                        <div className="bs-quantity">
                            <button
                                className="bs-qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <input
                                className="bs-qty-value"
                                type="text"
                                value={quantity}
                                readOnly
                            />
                            <button
                                className="bs-qty-btn"
                                onClick={() => setQuantity(q => Math.min((activeVariant?.stock || 100), q + 1))}
                                disabled={quantity >= (activeVariant?.stock || 100)}
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <button
                            className={`bs-add-btn ${isAdded ? 'added' : ''}`}
                            onClick={handleAdd}
                            disabled={!activeVariant?.inStock}
                        >
                            {isAdded ? (
                                <><Check size={20} /> ¡Agregado!</>
                            ) : !activeVariant?.inStock ? (
                                'Agotado'
                            ) : (
                                <><ShoppingCart size={20} /> Agregar</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
