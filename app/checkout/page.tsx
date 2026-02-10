'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useUser, UserOrder } from '@/lib/UserContext';
import {
    ArrowLeft,
    ShoppingBag,
    CreditCard,
    CheckCircle,
    Shield,
    Lock,
    User
} from 'lucide-react';
import './checkout.css';

interface CheckoutFormData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    notes: string;
    paymentMethod: 'mercadopago' | 'transfer' | 'whatsapp';
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { login, addOrder } = useUser();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const [formData, setFormData] = useState<CheckoutFormData>({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: '',
        paymentMethod: 'whatsapp',
    });

    // Discount code state
    const [discountCode, setDiscountCode] = useState('');
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{
        code: string;
        type: string;
        value: number;
        discountAmount: number;
        description: string;
    } | null>(null);

    const baseShipping = subtotal >= 999 ? 0 : 150;
    const shipping = appliedDiscount?.type === 'FREE_SHIPPING' ? 0 : baseShipping;
    const discountAmount = appliedDiscount
        ? appliedDiscount.type === 'FREE_SHIPPING'
            ? baseShipping
            : appliedDiscount.discountAmount
        : 0;
    const total = subtotal + shipping - discountAmount;

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        setDiscountLoading(true);
        setDiscountError('');
        setAppliedDiscount(null);

        try {
            const res = await fetch(
                `/api/discounts/validate?code=${encodeURIComponent(discountCode.trim())}&subtotal=${subtotal}`
            );
            const data = await res.json();

            if (data.valid) {
                setAppliedDiscount(data.discount);
                setDiscountError('');
            } else {
                setDiscountError(data.message || 'Código no válido.');
                setAppliedDiscount(null);
            }
        } catch {
            setDiscountError('Error al validar el código. Intenta de nuevo.');
            setAppliedDiscount(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountError('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateOrderNumber = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `DEL-${timestamp}-${random}`;
    };

    const generateWhatsAppMessage = (orderId: string) => {
        let message = `🛒 *Nuevo Pedido #${orderId}*\n\n`;
        message += `👤 *Cliente:* ${formData.firstName} ${formData.lastName}\n`;
        message += `📧 *Email:* ${formData.email}\n`;
        message += `📱 *Teléfono:* ${formData.phone}\n\n`;
        message += `📍 *Dirección de envío:*\n`;
        message += `${formData.address}\n`;
        message += `${formData.city}, ${formData.state} ${formData.zipCode}\n\n`;
        message += `📦 *Productos:*\n`;

        items.forEach(item => {
            message += `• ${item.productName}`;
            if (item.variantName) message += ` (${item.variantName})`;
            message += ` x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-MX')}\n`;
        });

        message += `\n💰 *Subtotal:* $${subtotal.toLocaleString('es-MX')}\n`;
        message += `🚚 *Envío:* ${shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')}`}\n`;
        if (appliedDiscount && discountAmount > 0) {
            message += `🏷️ *Descuento (${appliedDiscount.code}):* -$${discountAmount.toLocaleString('es-MX')}\n`;
        }
        message += `✨ *Total:* $${total.toLocaleString('es-MX')} MXN\n\n`;

        if (formData.notes) {
            message += `📝 *Notas:* ${formData.notes}\n\n`;
        }

        message += `Por favor confirmen mi pedido. ¡Gracias!`;

        return encodeURIComponent(message);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (formData.paymentMethod === 'mercadopago') {
                // Mercado Pago flow: create order in DB + redirect to MP
                const response = await fetch('/api/checkout/create-preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: items.map(item => ({
                            variantId: item.variantId,
                            productName: item.productName,
                            variantName: item.variantName,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image,
                        })),
                        customer: {
                            email: formData.email,
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            phone: formData.phone,
                        },
                        shipping: {
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
                        },
                        notes: formData.notes,
                        subtotal,
                        shippingCost: shipping,
                        total,
                        discountCode: appliedDiscount?.code || undefined,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al procesar el pago');
                }

                // Redirect to Mercado Pago
                window.location.href = data.initPoint || data.sandboxInitPoint;
                return;

            } else {
                // WhatsApp / Transfer flow (existing logic)
                const orderId = generateOrderNumber();
                setOrderNumber(orderId);

                const newOrder: UserOrder = {
                    id: orderId,
                    date: new Date().toISOString(),
                    status: 'pending',
                    items: items.map(item => ({
                        productName: item.productName,
                        variantName: item.variantName,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image
                    })),
                    shipping,
                    total,
                    shippingAddress: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode
                    }
                };

                login(formData.email, formData.firstName, formData.lastName, formData.phone);

                setTimeout(() => {
                    addOrder(newOrder);
                }, 100);

                if (formData.paymentMethod === 'whatsapp') {
                    const message = generateWhatsAppMessage(orderId);
                    const whatsappUrl = `https://wa.me/5215519915154?text=${message}`;
                    window.open(whatsappUrl, '_blank');
                }

                setTimeout(() => {
                    clearCart();
                    setOrderComplete(true);
                    setIsSubmitting(false);
                }, 1000);
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Hubo un error al procesar tu pedido');
            setIsSubmitting(false);
        }
    };

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="checkout-empty">
                        <ShoppingBag size={64} strokeWidth={1} />
                        <h1>Tu carrito está vacío</h1>
                        <p>Agrega productos antes de proceder al checkout.</p>
                        <Link href="/tienda" className="btn-primary">
                            Ir a la tienda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="checkout-success">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1>¡Pedido Realizado!</h1>
                        <p className="order-number">Pedido #{orderNumber}</p>
                        <p className="success-message">
                            Hemos recibido tu pedido. Te contactaremos pronto para confirmar
                            los detalles y coordinar el envío.
                        </p>
                        <div className="success-actions">
                            <Link href="/perfil" className="btn-primary">
                                <User size={18} />
                                Ver mis pedidos
                            </Link>
                            <Link href="/" className="btn-secondary">
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-header">
                    <Link href="/carrito" className="back-link">
                        <ArrowLeft size={20} />
                        Volver al carrito
                    </Link>
                    <h1>Checkout</h1>
                </div>

                <div className="checkout-grid">
                    {/* Checkout Form */}
                    <div className="checkout-form-section">
                        {/* Progress Steps */}
                        <div className="checkout-steps">
                            <div className={`step ${step >= 1 ? 'active' : ''}`}>
                                <span className="step-number">1</span>
                                <span className="step-label">Información</span>
                            </div>
                            <div className="step-line" />
                            <div className={`step ${step >= 2 ? 'active' : ''}`}>
                                <span className="step-number">2</span>
                                <span className="step-label">Envío</span>
                            </div>
                            <div className="step-line" />
                            <div className={`step ${step >= 3 ? 'active' : ''}`}>
                                <span className="step-number">3</span>
                                <span className="step-label">Pago</span>
                            </div>
                        </div>

                        {/* Step 1: Contact Information */}
                        {step === 1 && (
                            <div className="checkout-card">
                                <h2>Información de Contacto</h2>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">Nombre *</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Juan"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Apellido *</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Pérez"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Teléfono *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="55 1234 5678"
                                        required
                                    />
                                </div>

                                <button
                                    className="btn-next"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.email || !formData.firstName || !formData.lastName || !formData.phone}
                                >
                                    Continuar a envío
                                </button>
                            </div>
                        )}

                        {/* Step 2: Shipping */}
                        {step === 2 && (
                            <div className="checkout-card">
                                <h2>Dirección de Envío</h2>

                                <div className="form-group">
                                    <label htmlFor="address">Dirección *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Calle, número, colonia"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">Ciudad *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Ciudad de México"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state">Estado *</label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="CDMX">Ciudad de México</option>
                                            <option value="Estado de México">Estado de México</option>
                                            <option value="Jalisco">Jalisco</option>
                                            <option value="Nuevo León">Nuevo León</option>
                                            <option value="Puebla">Puebla</option>
                                            <option value="Querétaro">Querétaro</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="zipCode">Código Postal *</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="01234"
                                        maxLength={5}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Notas del pedido (opcional)</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Instrucciones especiales de entrega..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button className="btn-back" onClick={() => setStep(1)}>
                                        <ArrowLeft size={18} />
                                        Atrás
                                    </button>
                                    <button
                                        className="btn-next"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.address || !formData.city || !formData.state || !formData.zipCode}
                                    >
                                        Continuar a pago
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="checkout-card">
                                <h2>Método de Pago</h2>

                                <div className="payment-methods">
                                    <label className={`payment-option ${formData.paymentMethod === 'mercadopago' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="mercadopago"
                                            checked={formData.paymentMethod === 'mercadopago'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-icon mercadopago">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="payment-info">
                                            <span className="payment-name">Mercado Pago</span>
                                            <span className="payment-desc">Tarjeta, transferencia o efectivo</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${formData.paymentMethod === 'whatsapp' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="whatsapp"
                                            checked={formData.paymentMethod === 'whatsapp'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-icon whatsapp">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </div>
                                        <div className="payment-info">
                                            <span className="payment-name">Pedir por WhatsApp</span>
                                            <span className="payment-desc">Te contactamos para confirmar el pago</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${formData.paymentMethod === 'transfer' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="transfer"
                                            checked={formData.paymentMethod === 'transfer'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-icon transfer">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="payment-info">
                                            <span className="payment-name">Transferencia Bancaria</span>
                                            <span className="payment-desc">Te enviamos los datos por correo</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="security-badges">
                                    <div className="badge">
                                        <Shield size={18} />
                                        <span>Compra Segura</span>
                                    </div>
                                    <div className="badge">
                                        <Lock size={18} />
                                        <span>Datos Protegidos</span>
                                    </div>
                                </div>

                                <div className="form-buttons">
                                    <button className="btn-back" onClick={() => setStep(2)}>
                                        <ArrowLeft size={18} />
                                        Atrás
                                    </button>
                                    <button
                                        className="btn-submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? 'Procesando...'
                                            : formData.paymentMethod === 'mercadopago'
                                                ? 'Pagar con Mercado Pago'
                                                : 'Confirmar Pedido'
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h2>Resumen del Pedido</h2>

                        <div className="summary-items">
                            {items.map((item) => (
                                <div key={item.variantId} className="summary-item">
                                    <div className="summary-item-image">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.productName}
                                                width={60}
                                                height={60}
                                            />
                                        ) : (
                                            <div className="summary-item-placeholder" />
                                        )}
                                        <span className="summary-item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="summary-item-info">
                                        <span className="summary-item-name">{item.productName}</span>
                                        {item.variantName && (
                                            <span className="summary-item-variant">{item.variantName}</span>
                                        )}
                                    </div>
                                    <span className="summary-item-price">
                                        ${(item.price * item.quantity).toLocaleString('es-MX')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Discount Code Section */}
                        <div style={{
                            padding: '1rem 0',
                            borderTop: '1px solid #f0ede8',
                            borderBottom: '1px solid #f0ede8',
                            marginBottom: '0.5rem',
                        }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '0.813rem',
                                    fontWeight: 600,
                                    color: '#5c5347',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                Código de descuento
                            </label>
                            {appliedDiscount ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '8px',
                                    padding: '0.625rem 0.75rem',
                                }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.813rem',
                                            fontWeight: 600,
                                            color: '#16a34a',
                                        }}>
                                            {appliedDiscount.code}
                                        </span>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            color: '#15803d',
                                            marginTop: '2px',
                                        }}>
                                            {appliedDiscount.description}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRemoveDiscount}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc2626',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                    }}>
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => {
                                                setDiscountCode(e.target.value.toUpperCase());
                                                if (discountError) setDiscountError('');
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleApplyDiscount();
                                                }
                                            }}
                                            placeholder="Ej: BIENVENIDO10"
                                            disabled={discountLoading}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem 0.75rem',
                                                border: discountError
                                                    ? '1px solid #fca5a5'
                                                    : '1px solid #d6d3cd',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                background: 'white',
                                                color: '#3d3a36',
                                                transition: 'border-color 0.2s',
                                                minWidth: 0,
                                            }}
                                            onFocus={(e) => {
                                                if (!discountError) e.currentTarget.style.borderColor = '#22c55e';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)';
                                            }}
                                            onBlur={(e) => {
                                                if (!discountError) e.currentTarget.style.borderColor = '#d6d3cd';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                        <button
                                            onClick={handleApplyDiscount}
                                            disabled={discountLoading || !discountCode.trim()}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: discountLoading || !discountCode.trim()
                                                    ? '#d6d3cd'
                                                    : '#3d6b2e',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.813rem',
                                                fontWeight: 600,
                                                cursor: discountLoading || !discountCode.trim()
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                                whiteSpace: 'nowrap',
                                                transition: 'background 0.2s',
                                                opacity: discountLoading || !discountCode.trim() ? 0.6 : 1,
                                            }}
                                            onMouseOver={(e) => {
                                                if (!discountLoading && discountCode.trim()) {
                                                    e.currentTarget.style.background = '#2d5121';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (!discountLoading && discountCode.trim()) {
                                                    e.currentTarget.style.background = '#3d6b2e';
                                                }
                                            }}
                                        >
                                            {discountLoading ? 'Validando...' : 'Aplicar'}
                                        </button>
                                    </div>
                                    {discountError && (
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#dc2626',
                                            margin: '0.375rem 0 0',
                                            lineHeight: 1.3,
                                        }}>
                                            {discountError}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Envío</span>
                                <span>
                                    {shipping === 0 ? (
                                        <span className="free-shipping">Gratis</span>
                                    ) : (
                                        `$${shipping.toLocaleString('es-MX')}`
                                    )}
                                </span>
                            </div>
                            {appliedDiscount && discountAmount > 0 && (
                                <div className="summary-row" style={{ color: '#16a34a' }}>
                                    <span style={{ color: '#16a34a' }}>Descuento</span>
                                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                                        -${discountAmount.toLocaleString('es-MX')}
                                    </span>
                                </div>
                            )}
                            <div className="summary-divider" />
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${total.toLocaleString('es-MX')} MXN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
