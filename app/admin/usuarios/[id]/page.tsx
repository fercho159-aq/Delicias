'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Trash2, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import '../../forms.css';

interface UserOrder {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string | number;
    createdAt: string;
}

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

export default function UsuarioDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [orderCount, setOrderCount] = useState(0);
    const [createdAt, setCreatedAt] = useState('');

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${id}`);
            if (!res.ok) {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Error al cargar el usuario' });
                return;
            }
            const user = await res.json();
            setEmail(user.email || '');
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPhone(user.phone || '');
            setRole(user.role || 'CUSTOMER');
            setOrders(user.orders || []);
            setOrderCount(user._count?.orders || 0);
            setCreatedAt(user.createdAt || '');
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al cargar el usuario' });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    phone: phone || null,
                    role,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al guardar' });
                return;
            }
            setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al guardar' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al eliminar' });
                setShowDeleteConfirm(false);
                return;
            }

            setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
            setTimeout(() => router.push('/admin/usuarios'), 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al eliminar' });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <div className="form-page-header">
                        <Link href="/admin/usuarios" className="back-link"><ArrowLeft size={18} /></Link>
                        <h1>Cargando usuario...</h1>
                    </div>
                </header>
                <div className="admin-content">
                    <div className="loading-spinner"><div className="spinner" /></div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="admin-header">
                <div className="form-page-header">
                    <Link href="/admin/usuarios" className="back-link"><ArrowLeft size={18} /></Link>
                    <h1>Editar Usuario</h1>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-admin danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                    <button
                        type="button"
                        className="btn-admin primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {message && (
                    <div className={`form-message ${message.type}`}>{message.text}</div>
                )}

                {showDeleteConfirm && (
                    <div className="delete-confirm">
                        <p>
                            ¿Estás seguro de que deseas eliminar este usuario?
                            {orderCount > 0 && <strong> Tiene {orderCount} pedido(s).</strong>}
                            {' '}Esta acción no se puede deshacer.
                        </p>
                        <div className="delete-confirm-actions">
                            <button type="button" className="btn-admin secondary" onClick={() => setShowDeleteConfirm(false)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn-admin danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Eliminando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="order-detail-grid">
                    <div>
                        {/* User Info */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2><User size={18} /> Información del Usuario</h2>
                            </div>
                            <div className="form-card-body">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Nombre</label>
                                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nombre" />
                                    </div>
                                    <div className="form-field">
                                        <label>Apellido</label>
                                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Apellido" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Email <span className="required">*</span></label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" required />
                                    </div>
                                    <div className="form-field">
                                        <label>Teléfono</label>
                                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="55 1234 5678" />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Rol</label>
                                    <select value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="CUSTOMER">Cliente</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="SUPER_ADMIN">Super Administrador</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Orders */}
                        {orders.length > 0 && (
                            <div className="form-card">
                                <div className="form-card-header">
                                    <h2><ShoppingCart size={18} /> Pedidos Recientes</h2>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {orderCount} total
                                    </span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>Orden</th>
                                                <th>Estado</th>
                                                <th>Pago</th>
                                                <th style={{ textAlign: 'right' }}>Total</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <Link href={`/admin/pedidos/${order.id}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                                                            #{order.orderNumber}
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                            {statusLabels[order.status] || order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'active' : 'pending'}`}>
                                                            {order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                        ${Number(order.total).toLocaleString('es-MX')}
                                                    </td>
                                                    <td style={{ fontSize: '0.813rem', color: '#64748b' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2>Resumen</h2>
                            </div>
                            <div className="form-card-body">
                                <div className="order-info-row">
                                    <span className="order-info-label">ID</span>
                                    <span className="order-info-value">#{id}</span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Pedidos</span>
                                    <span className="order-info-value">{orderCount}</span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">Registro</span>
                                    <span className="order-info-value" style={{ fontSize: '0.813rem' }}>
                                        {createdAt ? new Date(createdAt).toLocaleDateString('es-MX', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        }) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/admin/usuarios"
                            className="btn-admin secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <ArrowLeft size={16} />
                            Volver a Usuarios
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
