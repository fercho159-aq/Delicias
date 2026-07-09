"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ProductBottomSheet, { type BottomSheetProduct } from './ProductBottomSheet';
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

function toNumber(val: number | { toNumber(): number } | null | undefined): number {
  if (val == null) return 0;
  if (typeof val === 'object' && 'toNumber' in val) return val.toNumber();
  return Number(val) || 0;
}

export function ProductCard({ product }: ProductCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const firstImage = product.images[0];
  const firstVariant = product.variants[0];

  const price = toNumber(firstVariant?.price);
  const salePrice = firstVariant?.salePrice ? toNumber(firstVariant.salePrice) : null;

  const imageUrl = firstImage?.url || '/placeholder-product.png';
  const isLocalImage = imageUrl.startsWith('/');

  const sheetProduct: BottomSheetProduct | null = sheetOpen ? {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    images: product.images,
    variants: product.variants.map(v => ({
      id: v.id,
      price: toNumber(v.price),
      salePrice: v.salePrice ? toNumber(v.salePrice) : null,
      weight: v.weight,
      stock: v.stock ?? 100,
      inStock: v.inStock ?? true,
    })),
  } : null;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSheetOpen(true);
  };

  return (
    <>
      <div className="product-card">
        <a href={`/productos/${product.slug}`} className="product-image-wrapper" onClick={handleCardClick}>
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

          {salePrice && salePrice < price && (
            <span className="product-badge sale">
              Oferta
            </span>
          )}
        </a>

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
            {firstVariant?.weight && (
              <span className="product-weight">{firstVariant.weight}</span>
            )}
          </div>

          <a href={`/productos/${product.slug}`} className="product-title-link" onClick={handleCardClick}>
            <h3 className="product-name">{product.name}</h3>
          </a>

          <div className="product-footer">
            <div className="product-prices">
              {salePrice && salePrice < price ? (
                <>
                  <span className="product-price-original">${price.toFixed(2)}</span>
                  <span className="product-price">${salePrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="product-price">${price.toFixed(2)}</span>
              )}
            </div>

            <button
              className="product-add-btn"
              aria-label="Agregar al carrito"
              onClick={() => setSheetOpen(true)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <ProductBottomSheet
        product={sheetProduct}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="products-grid">
      {children}
    </div>
  );
}
