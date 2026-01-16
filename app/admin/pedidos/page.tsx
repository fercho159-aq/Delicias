import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

async function getOrders() {
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            items: {
                include: {
                    variant: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return orders;
}

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

export default async function PedidosAdmin() {
    const orders = await getOrders();

    return (
        <>
            <header className="admin-header">
                <h1>Pedidos</h1>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todos los pedidos ({orders.length})</h2>
                        <div className="table-actions">
                            <div className="search-input">
                                <Search size={18} />
                                <input type="text" placeholder="Buscar pedidos..." />
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
                            {orders.map((order: any) => {
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

                    {orders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b' }}>
                                No hay pedidos aún
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
