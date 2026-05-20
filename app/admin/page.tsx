import { prisma } from '@/lib/prisma';
import { Package, ShoppingCart, Users, DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
    const [
        productsCount,
        ordersCount,
        usersCount,
        recentOrders,
        totalRevenue
    ] = await Promise.all([
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count(),
        prisma.user.count(),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                items: true
            }
        }),
        prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { total: true }
        })
    ]);

    return {
        productsCount,
        ordersCount,
        usersCount,
        recentOrders,
        totalRevenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0
    };
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
};

export default async function AdminDashboard() {
    const stats = await getStats();
    const greeting = getGreeting();

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>{greeting}</h1>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: 500 }}>
                        Resumen general de tu tienda
                    </p>
                </div>
                <div className="header-actions">
                    <Link href="/admin/productos/nuevo" className="btn-admin primary">
                        <Package size={18} />
                        Nuevo Producto
                    </Link>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon green">
                                <Package size={24} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.productsCount}</div>
                        <div className="stat-label">Productos Activos</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon blue">
                                <ShoppingCart size={24} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.ordersCount}</div>
                        <div className="stat-label">Total Pedidos</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon yellow">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.usersCount}</div>
                        <div className="stat-label">Usuarios Registrados</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon purple">
                                <DollarSign size={24} />
                            </div>
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    color: '#64748b',
                                    background: 'rgba(100, 116, 139, 0.1)',
                                    padding: '0.2rem 0.45rem',
                                    borderRadius: 6
                                }}
                            >
                                MXN
                            </span>
                        </div>
                        <div className="stat-value">
                            ${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className="stat-label">Ingresos Totales</div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Pedidos Recientes</h2>
                        <Link href="/admin/pedidos" className="btn-admin secondary">
                            Ver todos
                        </Link>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link href={`/admin/pedidos/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <strong>#{order.orderNumber}</strong>
                                            </Link>
                                        </td>
                                        <td>{order.user?.email || 'Invitado'}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td>${Number(order.total).toLocaleString('es-MX')}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link
                                                href={`/admin/pedidos/${order.id}`}
                                                style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center' }}
                                                aria-label="Ver pedido"
                                            >
                                                <ChevronRight size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 2rem', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                            <ShoppingCart size={32} />
                                            <div style={{ fontWeight: 600, color: '#64748b' }}>Aún no hay pedidos</div>
                                            <div style={{ fontSize: '0.875rem' }}>Los nuevos pedidos aparecerán aquí</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
