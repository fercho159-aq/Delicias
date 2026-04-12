import { prisma } from '@/lib/prisma';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
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

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <>
            <header className="admin-header">
                <h1>Dashboard</h1>
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
                        <div className="stat-change positive">
                            <TrendingUp size={14} />
                            +12% este mes
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon blue">
                                <ShoppingCart size={24} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.ordersCount}</div>
                        <div className="stat-label">Total Pedidos</div>
                        <div className="stat-change positive">
                            <TrendingUp size={14} />
                            +8% este mes
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon yellow">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.usersCount}</div>
                        <div className="stat-label">Usuarios Registrados</div>
                        <div className="stat-change positive">
                            <TrendingUp size={14} />
                            +5% este mes
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon purple">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="stat-value">
                            ${stats.totalRevenue.toLocaleString('es-MX')}
                        </div>
                        <div className="stat-label">Ingresos Totales</div>
                        <div className="stat-change positive">
                            <TrendingUp size={14} />
                            +15% este mes
                        </div>
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
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>#{order.orderNumber}</strong>
                                        </td>
                                        <td>{order.user?.email || 'Invitado'}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>${Number(order.total).toLocaleString('es-MX')}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                        No hay pedidos aún
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
