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
    Store
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
                    <Link href="/admin" className="sidebar-logo">
                        <Store size={24} />
                        <span>Admin</span> Panel
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Menú Principal</span>
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
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user.email}</div>
                            <div className="user-role">{user.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="nav-item"
                        style={{ width: '100%', marginTop: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
