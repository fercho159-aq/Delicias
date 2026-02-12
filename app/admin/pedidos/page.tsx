'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string | number;
    createdAt: string;
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
    } | null;
    items: { id: number }[];
}

const ITEMS_PER_PAGE = 20;

const statusIcons: Record<string, any> = {
    PENDING: Clock,
    CONFIRMED: CheckCircle,
    PROCESSING: Clock,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

export default function PedidosAdmin() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // We need to fetch via an API. Let's use the existing orders endpoint
            // Since there's no GET /api/admin/orders, we'll create a simple fetch
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch {
            console.error('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter(order => {
        const matchSearch = !search ||
            order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            (order.user?.email && order.user.email.toLowerCase().includes(search.toLowerCase())) ||
            (order.user?.firstName && order.user.firstName.toLowerCase().includes(search.toLowerCase())) ||
            (order.user?.lastName && order.user.lastName.toLowerCase().includes(search.toLowerCase()));

        const matchStatus = !statusFilter || order.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    useEffect(() => { setPage(1); }, [search, statusFilter]);

    if (loading) {
        return (
            <>
                <header className="admin-header"><h1>Pedidos</h1></header>
                <div className="admin-content">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto', width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="admin-header">
                <h1>Pedidos</h1>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todos los pedidos ({filtered.length})</h2>
                        <div className="table-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    background: 'white',
                                }}
                            >
                                <option value="">Todos los estados</option>
                                <option value="PENDING">Pendiente</option>
                                <option value="CONFIRMED">Confirmado</option>
                                <option value="PROCESSING">Procesando</option>
                                <option value="SHIPPED">Enviado</option>
                                <option value="DELIVERED">Entregado</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                            <div className="search-input">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar pedidos..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Pago</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((order) => {
                                const StatusIcon = statusIcons[order.status] || Clock;
                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>#{order.orderNumber}</strong>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {order.user?.firstName} {order.user?.lastName || order.user?.email || 'Invitado'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {order.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{order.items.length} items</td>
                                        <td style={{ fontWeight: 600 }}>
                                            ${Number(order.total).toLocaleString('es-MX')}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                <StatusIcon size={14} style={{ marginRight: 4 }} />
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'active' : order.paymentStatus === 'PENDING' ? 'pending' : 'inactive'}`}>
                                                {order.paymentStatus === 'PAID' ? 'Pagado' :
                                                    order.paymentStatus === 'PENDING' ? 'Pendiente' :
                                                        order.paymentStatus === 'FAILED' ? 'Fallido' : 'Reembolsado'}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <Link
                                                    href={`/admin/pedidos/${order.id}`}
                                                    className="action-btn"
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b' }}>
                                {search || statusFilter ? 'No se encontraron pedidos' : 'No hay pedidos aún'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            borderTop: '1px solid #e2e8f0',
                        }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="action-btn"
                                style={{ opacity: page === 1 ? 0.5 : 1 }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '0.875rem', color: '#64748b', padding: '0 0.75rem' }}>
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="action-btn"
                                style={{ opacity: page === totalPages ? 0.5 : 1 }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
