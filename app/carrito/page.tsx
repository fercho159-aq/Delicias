'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import './carrito.css';

export default function CarritoPage() {
    const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

    const shipping = subtotal >= 999 ? 0 : 150;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="carrito-page">
                <div className="container">
                    <div className="carrito-empty">
                        <ShoppingBag size={64} strokeWidth={1} />
                        <h1>Tu carrito está vacío</h1>
                        <p>Parece que aún no has agregado nada a tu carrito.</p>
                        <Link href="/tienda" className="btn-primary">
                            <ArrowLeft size={18} />
                            Explorar Productos
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="carrito-page">
            <div className="container">
                <div className="carrito-header">
                    <h1>Tu Carrito</h1>
                    <span className="carrito-count">{itemCount} productos</span>
                </div>

                <div className="carrito-grid">
                    {/* Cart Items */}
                    <div className="carrito-items-section">
                        <div className="carrito-items-header">
                            <span>Producto</span>
                            <span>Cantidad</span>
                            <span>Precio</span>
                        </div>

                        {items.map((item) => (
                            <div key={item.variantId} className="carrito-item">
                                <div className="carrito-item-product">
                                    <div className="carrito-item-image">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.productName}
                                                width={100}
                                                height={100}
                                            />
                                        ) : (
                                            <div className="carrito-item-placeholder" />
                                        )}
                                    </div>
                                    <div className="carrito-item-info">
                                        <Link href={`/productos/${item.productSlug}`} className="carrito-item-name">
                                            {item.productName}
                                        </Link>
                                        {item.variantName && (
                                            <span className="carrito-item-variant">{item.variantName}</span>
                                        )}
                                        <button
                                            className="carrito-item-remove"
                                            onClick={() => removeItem(item.variantId)}
                                        >
                                            <Trash2 size={14} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                <div className="carrito-item-quantity">
                                    <div className="quantity-control-large">
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value) || 1)}
                                            min={1}
                                            max={item.maxStock}
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                            disabled={item.quantity >= item.maxStock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="carrito-item-price">
                                    <span className="price-total">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                                    <span className="price-unit">${item.price.toLocaleString('es-MX')} c/u</span>
                                </div>
                            </div>
                        ))}

                        <div className="carrito-actions">
                            <Link href="/tienda" className="btn-secondary">
                                <ArrowLeft size={18} />
                                Seguir comprando
                            </Link>
                            <button className="btn-text" onClick={clearCart}>
                                <Trash2 size={16} />
                                Vaciar carrito
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="carrito-summary">
                        <h2>Resumen del Pedido</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-MX')}</span>
                        </div>

                        <div className="summary-row">
                            <span>Envío</span>
                            <span>
                                {shipping === 0 ? (
                                    <span className="free-shipping">¡Gratis!</span>
                                ) : (
                                    `$${shipping.toLocaleString('es-MX')}`
                                )}
                            </span>
                        </div>

                        {subtotal < 999 && (
                            <div className="shipping-promo">
                                <p>
                                    ¡Te faltan <strong>${(999 - subtotal).toLocaleString('es-MX')}</strong> para envío gratis!
                                </p>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="summary-divider" />

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${total.toLocaleString('es-MX')} MXN</span>
                        </div>

                        <Link href="/checkout" className="btn-checkout">
                            Proceder al Checkout
                            <ArrowRight size={18} />
                        </Link>

                        <div className="summary-info">
                            <p>✓ Pago 100% seguro</p>
                            <p>✓ Productos frescos garantizados</p>
                            <p>✓ Empaque especial para conservar frescura</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
