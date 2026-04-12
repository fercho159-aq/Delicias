'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer() {
    const { items, isOpen, closeCart, itemCount, subtotal, updateQuantity, removeItem } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="cart-overlay" onClick={closeCart} />

            {/* Drawer */}
            <div className="cart-drawer">
                <div className="cart-header">
                    <h2>
                        <ShoppingBag size={20} />
                        Tu Carrito ({itemCount})
                    </h2>
                    <button className="cart-close" onClick={closeCart}>
                        <X size={24} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <ShoppingBag size={48} strokeWidth={1} />
                        <p>Tu carrito está vacío</p>
                        <button onClick={closeCart} className="cart-continue-btn">
                            Continuar comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={item.variantId} className="cart-item">
                                    <div className="cart-item-image">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.productName}
                                                width={80}
                                                height={80}
                                            />
                                        ) : (
                                            <div className="cart-item-placeholder" />
                                        )}
                                    </div>
                                    <div className="cart-item-details">
                                        <Link
                                            href={`/productos/${item.productSlug}`}
                                            className="cart-item-name"
                                            onClick={closeCart}
                                        >
                                            {item.productName}
                                        </Link>
                                        {item.variantName && (
                                            <span className="cart-item-variant">{item.variantName}</span>
                                        )}
                                        <span className="cart-item-price">
                                            ${item.price.toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                disabled={item.quantity >= item.maxStock}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeItem(item.variantId)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-subtotal">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString('es-MX')}</span>
                            </div>
                            <p className="cart-shipping-note">
                                Envío calculado en el checkout
                            </p>
                            <Link
                                href="/checkout"
                                className="cart-checkout-btn"
                                onClick={closeCart}
                            >
                                Proceder al Checkout
                            </Link>
                            <button className="cart-continue" onClick={closeCart}>
                                Continuar comprando
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
