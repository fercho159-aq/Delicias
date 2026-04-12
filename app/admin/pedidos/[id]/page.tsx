'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Save, ArrowLeft, Package, Truck, User,
    MapPin, CreditCard, Clock, CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import '../../forms.css';

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: string | number;
    total: string | number;
    variant: {
        name: string;
        product: {
            id: number;
            name: string;
            slug: string;
        };
    };
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    subtotal: string | number;
    shippingCost: string | number;
    discount: string | number;
    total: string | number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
    } | null;
    items: OrderItem[];
    shippingAddress: {
        id: number;
        firstName: string;
        lastName: string;
        street: string;
        colony: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string | null;
    } | null;
}

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
};

const paymentStatusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    FAILED: 'Fallido',
    REFUNDED: 'Reembolsado',
};

const statusBadgeClass: Record<string, string> = {
    PENDING: 'pending',
    CONFIRMED: 'active',
    PROCESSING: 'pending',
    SHIPPED: 'active',
    DELIVERED: 'active',
    CANCELLED: 'inactive',
    REFUNDED: 'inactive',
};

const paymentBadgeClass: Record<string, string> = {
    PENDING: 'pending',
    PAID: 'active',
    FAILED: 'inactive',
    REFUNDED: 'draft',
};

const statusIcons: Record<string, React.ComponentType<{ size?: number }>> = {
    PENDING: Clock,
    CONFIRMED: CheckCircle,
    PROCESSING: Clock,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
    REFUNDED: XCircle,
};

function formatCurrency(value: string | number): string {
    return `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PedidoDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [order, setOrder] = useState<Order | null>(null);

    // Editable fields
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Error al cargar el pedido' });
                return;
            }
            const data = await res.json();
            setOrder(data);
            setOrderStatus(data.status);
            setPaymentStatus(data.paymentStatus);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al cargar el pedido' });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Clear message after 5s
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSaveStatus = async () => {
        if (!order) return;

        // Only save if something changed
        if (orderStatus === order.status && paymentStatus === order.paymentStatus) {
            setMessage({ type: 'error', text: 'No hay cambios para guardar' });
            return;
        }

        setSaving(true);
        setMessage(null);

        const body: Record<string, string> = {};
        if (orderStatus !== order.status) body.status = orderStatus;
        if (paymentStatus !== order.paymentStatus) body.paymentStatus = paymentStatus;

        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al actualizar el pedido' });
                return;
            }

            setMessage({ type: 'success', text: 'Estado del pedido actualizado correctamente' });
            // Refresh order data
            setOrder(prev => prev ? {
                ...prev,
                status: orderStatus,
                paymentStatus: paymentStatus,
            } : null);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al guardar' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <div className="form-page-header">
                        <Link href="/admin/pedidos" className="back-link">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Cargando pedido...</h1>
                    </div>
                </header>
                <div className="admin-content">
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                </div>
            </>
        );
    }

    if (!order) {
        return (
            <>
                <header className="admin-header">
                    <div className="form-page-header">
                        <Link href="/admin/pedidos" className="back-link">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Pedido no encontrado</h1>
                    </div>
                </header>
                <div className="admin-content">
                    {message && (
                        <div className={`form-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="form-card">
                        <div className="form-card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                No se encontro el pedido solicitado.
                            </p>
                            <Link href="/admin/pedidos" className="btn-admin primary">
                                Volver a pedidos
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const StatusIcon = statusIcons[order.status] || Clock;

    return (
        <>
            <header className="admin-header">
                <div className="form-page-header">
                    <Link href="/admin/pedidos" className="back-link">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1>Pedido #{order.orderNumber}</h1>
                </div>
                <div className="header-actions">
                    <span className={`status-badge ${statusBadgeClass[order.status]}`}>
                        <StatusIcon size={14} />
                        {' '}{statusLabels[order.status]}
                    </span>
                </div>
            </header>

            <div className="admin-content">
                {message && (
                    <div className={`form-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="order-detail-grid">
                    {/* Left Column: Items and details */}
                    <div>
                        {/* Order Items */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2><Package size={18} /> Productos del Pedido</h2>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                                </span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="order-items-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Variante</th>
                                            <th style={{ textAlign: 'center' }}>Cantidad</th>
                                            <th style={{ textAlign: 'right' }}>Precio</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.variant?.product?.name || item.name}</strong>
                                                </td>
                                                <td style={{ color: '#64748b' }}>
                                                    {item.variant?.name || '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {item.quantity}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {formatCurrency(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Order Totals */}
                            <div className="order-totals">
                                <div className="order-total-row">
                                    <span style={{ color: '#64748b' }}>Subtotal</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="order-total-row">
                                    <span style={{ color: '#64748b' }}>Envio</span>
                                    <span>
                                        {Number(order.shippingCost) > 0
                                            ? formatCurrency(order.shippingCost)
                                            : 'Gratis'
                                        }
                                    </span>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="order-total-row">
                                        <span style={{ color: '#64748b' }}>Descuento</span>
                                        <span style={{ color: '#dc2626' }}>
                                            -{formatCurrency(order.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="order-total-row final">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="form-card">
                                <div className="form-card-header">
                                    <h2><MapPin size={18} /> Direccion de Envio</h2>
                                </div>
                                <div className="form-card-body">
                                    <div className="address-block">
                                        <strong>
                                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                        </strong>
                                        <br />
                                        {order.shippingAddress.street}
                                        <br />
                                        {order.shippingAddress.colony && (
                                            <>{order.shippingAddress.colony}<br /></>
                                        )}
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                        <br />
                                        {order.shippingAddress.country}
                                        {order.shippingAddress.phone && (
                                            <>
                                                <br />
                                                Tel: {order.shippingAddress.phone}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                            <div className="form-card">
                                <div className="form-card-header">
                                    <h2>Notas del Pedido</h2>
                                </div>
                                <div className="form-card-body">
                                    <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                                        {order.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary and actions */}
                    <div>
                        {/* Customer Info */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2><User size={18} /> Cliente</h2>
                            </div>
                            <div className="form-card-body">
                                {order.user ? (
                                    <>
                                        <div className="order-info-row">
                                            <span className="order-info-label">Nombre</span>
                                            <span className="order-info-value">
                                                {order.user.firstName} {order.user.lastName}
                                            </span>
                                        </div>
                                        <div className="order-info-row">
                                            <span className="order-info-label">Email</span>
                                            <span className="order-info-value" style={{ fontSize: '0.813rem' }}>
                                                {order.user.email}
                                            </span>
                                        </div>
                                        {order.user.phone && (
                                            <div className="order-info-row">
                                                <span className="order-info-label">Telefono</span>
                                                <span className="order-info-value">
                                                    {order.user.phone}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                                        Cliente invitado
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2><CreditCard size={18} /> Informacion del Pedido</h2>
                            </div>
                            <div className="form-card-body">
                                <div className="order-info-row">
                                    <span className="order-info-label">Numero de Orden</span>
                                    <span className="order-info-value">
                                        #{order.orderNumber}
                                    </span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Fecha</span>
                                    <span className="order-info-value" style={{ fontSize: '0.813rem' }}>
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Metodo de Pago</span>
                                    <span className="order-info-value">
                                        {order.paymentMethod || 'No especificado'}
                                    </span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Estado de Pago</span>
                                    <span className={`status-badge ${paymentBadgeClass[order.paymentStatus]}`}>
                                        {paymentStatusLabels[order.paymentStatus]}
                                    </span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Total</span>
                                    <span className="order-info-value large">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Update Status */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2>Actualizar Estado</h2>
                            </div>
                            <div className="form-card-body">
                                <div className="form-field">
                                    <label>Estado del Pedido</label>
                                    <select
                                        value={orderStatus}
                                        onChange={e => setOrderStatus(e.target.value)}
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                        <option value="PROCESSING">Procesando</option>
                                        <option value="SHIPPED">Enviado</option>
                                        <option value="DELIVERED">Entregado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                        <option value="REFUNDED">Reembolsado</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Estado de Pago</label>
                                    <select
                                        value={paymentStatus}
                                        onChange={e => setPaymentStatus(e.target.value)}
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="PAID">Pagado</option>
                                        <option value="FAILED">Fallido</option>
                                        <option value="REFUNDED">Reembolsado</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="btn-admin primary"
                                    onClick={handleSaveStatus}
                                    disabled={saving}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <Save size={16} />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>

                        {/* Back Button */}
                        <Link
                            href="/admin/pedidos"
                            className="btn-admin secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <ArrowLeft size={16} />
                            Volver a Pedidos
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
