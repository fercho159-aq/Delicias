import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Eye, ShieldCheck, User } from 'lucide-react';

async function getUsers() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { orders: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    });
    return users;
}

const roleLabels: Record<string, string> = {
    CUSTOMER: 'Cliente',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'Super Admin',
};

const roleBadgeClass: Record<string, string> = {
    CUSTOMER: 'active',
    ADMIN: 'pending',
    SUPER_ADMIN: 'draft',
};

export default async function UsuariosAdmin() {
    const users = await getUsers();

    return (
        <>
            <header className="admin-header">
                <h1>Usuarios</h1>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todos los usuarios ({users.length})</h2>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                <th>Pedidos</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div style={{
                                                width: 40, height: 40,
                                                borderRadius: '50%',
                                                background: user.role === 'CUSTOMER' ? '#dbeafe' : '#fef3c7',
                                                color: user.role === 'CUSTOMER' ? '#2563eb' : '#d97706',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                flexShrink: 0,
                                            }}>
                                                {user.role !== 'CUSTOMER' ? (
                                                    <ShieldCheck size={20} />
                                                ) : (
                                                    (user.firstName?.[0] || user.email[0]).toUpperCase()
                                                )}
                                            </div>
                                            <div className="product-info">
                                                <h4>
                                                    {user.firstName || user.lastName
                                                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                        : 'Sin nombre'}
                                                </h4>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.813rem' }}>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${roleBadgeClass[user.role]}`}>
                                            {roleLabels[user.role]}
                                        </span>
                                    </td>
                                    <td>{user._count.orders}</td>
                                    <td style={{ fontSize: '0.813rem', color: '#64748b' }}>
                                        {new Date(user.createdAt).toLocaleDateString('es-MX', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <Link
                                                href={`/admin/usuarios/${user.id}`}
                                                className="action-btn"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b' }}>
                                No hay usuarios registrados aún
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
