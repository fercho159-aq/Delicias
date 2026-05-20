'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingCart,
    Settings,
    LogOut,
    Users,
    Tag,
    Store,
    ExternalLink
} from 'lucide-react';

interface AdminLayoutClientProps {
    children: React.ReactNode;
    user: {
        email: string;
        role: string;
    };
}

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/productos', icon: Package, label: 'Productos' },
    { href: '/admin/categorias', icon: FolderOpen, label: 'Categorías' },
    { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/admin/descuentos', icon: Tag, label: 'Descuentos' },
    { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
];

function formatRole(role: string): string {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Administrador';
    return role;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Link href="/admin" className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <Store size={18} />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Las Delicias</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.65, fontWeight: 500 }}>Admin Panel</span>
                        </span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Gestión</span>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="nav-section">
                        <span className="nav-section-title">Tienda</span>
                        <Link href="/" className="nav-item" target="_blank">
                            <Store size={20} />
                            Ver Tienda
                            <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div
                                className="user-name"
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                                {user.email}
                            </div>
                            <div className="user-role">{formatRole(user.role)}</div>
                        </div>
                    </div>
                    <div
                        className="sidebar-logout"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            paddingTop: '0.75rem',
                            marginTop: '0.75rem'
                        }}
                    >
                        <button
                            onClick={handleLogout}
                            className="nav-item"
                            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
