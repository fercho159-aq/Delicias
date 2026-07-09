"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import './ProductCard.css';

interface ProductVariant {
  id: number;
  price: number | { toNumber(): number };
  salePrice?: number | { toNumber(): number } | null;
  weight?: string | null;
  stock: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    category?: {
      name: string;
      slug: string;
    } | null;
    images: {
      url: string;
      alt?: string | null;
    }[];
    variants: ProductVariant[];
  };
}

function toNum(val: number | { toNumber(): number } | null | undefined): number {
  if (val == null) return 0;
  if (typeof val === 'object' && 'toNumber' in val) return val.toNumber();
  return Number(val) || 0;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number>(product.variants[0]?.id || 0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const firstImage = product.images[0];

  const price = toNum(activeVariant?.price);
  const salePrice = activeVariant?.salePrice ? toNum(activeVariant.salePrice) : null;
  const hasDiscount = salePrice !== null && salePrice < price;
  const displayPrice = hasDiscount ? salePrice : price;

  const imageUrl = firstImage?.url || '/placeholder-product.png';
  const isLocalImage = imageUrl.startsWith('/');

  const handleAdd = () => {
    if (!activeVariant?.inStock) return;
    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: activeVariant.weight ? String(activeVariant.weight) : '',
      price: displayPrice,
      quantity,
      image: firstImage?.url || null,
      maxStock: activeVariant.stock ?? 100,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link href={`/productos/${product.slug}`} className="product-image-wrapper">
        {isLocalImage ? (
          <Image
            src={imageUrl}
            alt={firstImage?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="product-image"
          />
        ) : (
          <img
            src={imageUrl}
            alt={firstImage?.alt || product.name}
            className="product-image"
          />
        )}

        {hasDiscount && (
          <span className="product-badge sale">Oferta</span>
        )}
      </Link>

      <div className="product-info">
        <div className="product-header">
          {product.category && (
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="product-category"
            >
              {product.category.name}
            </Link>
          )}
        </div>

        <h3 className="product-name">{product.name}</h3>

        {/* Price */}
        <div className="product-footer">
          <div className="product-prices">
            {hasDiscount ? (
              <>
                <span className="product-price-original">${price.toFixed(2)}</span>
                <span className="product-price">${salePrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="product-price">${price.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Variants inline */}
        {product.variants.length > 1 && (
          <div className="card-variants">
            {product.variants.map(v => {
              const vPrice = toNum(v.salePrice && toNum(v.salePrice) < toNum(v.price) ? v.salePrice : v.price);
              return (
                <button
                  key={v.id}
                  className={`card-variant-btn ${selectedVariantId === v.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                >
                  <span className="card-variant-weight">{v.weight || 'Std'}</span>
                  <span className="card-variant-price">${vPrice.toFixed(0)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quantity + Add */}
        <div className="card-actions">
          <div className="card-qty">
            <button
              className="card-qty-btn"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="card-qty-val">{quantity}</span>
            <button
              className="card-qty-btn"
              onClick={() => setQuantity(q => Math.min((activeVariant?.stock ?? 100), q + 1))}
              disabled={quantity >= (activeVariant?.stock ?? 100)}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            className={`card-add-btn ${isAdded ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={!activeVariant?.inStock}
          >
            {isAdded ? (
              <><Check size={16} /> <span>Listo</span></>
            ) : !activeVariant?.inStock ? (
              <span>Agotado</span>
            ) : (
              <><ShoppingCart size={16} /> <span>Agregar</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="products-grid">
      {children}
    </div>
  );
}
