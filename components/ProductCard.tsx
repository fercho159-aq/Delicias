"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus } from 'lucide-react';
import './ProductCard.css';

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
    variants: {
      price: number | { toNumber(): number };
      salePrice?: number | { toNumber(): number } | null;
      weight?: string | null;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const firstVariant = product.variants[0];

  // Handle Decimal type from Prisma
  // Handle Decimal type from Prisma or serialized string
  const rawPrice = firstVariant?.price;
  const price = typeof rawPrice === 'object' && rawPrice && 'toNumber' in rawPrice
    ? rawPrice.toNumber()
    : Number(rawPrice) || 0;

  const rawSalePrice = firstVariant?.salePrice;
  const salePrice = rawSalePrice
    ? (typeof rawSalePrice === 'object' && 'toNumber' in rawSalePrice
      ? rawSalePrice.toNumber()
      : Number(rawSalePrice))
    : null;

  // Get image URL - use placeholder if no image
  const imageUrl = firstImage?.url || '/placeholder-product.png';
  const isLocalImage = imageUrl.startsWith('/');

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

        {salePrice && salePrice < price && (
          <span className="product-badge sale">
            Oferta
          </span>
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
          {firstVariant?.weight && (
            <span className="product-weight">{firstVariant.weight}</span>
          )}
        </div>

        <Link href={`/productos/${product.slug}`} className="product-title-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>

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

          <button className="product-add-btn" aria-label="Agregar al carrito">
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Grid component for products
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="products-grid">
      {children}
    </div>
  );
}
