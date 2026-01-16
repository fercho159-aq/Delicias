'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/lib/UserContext';
import {
    User,
    Package,
    MapPin,
    LogOut,
    Clock,
    CheckCircle,
    Truck,
    Check,
    ChevronRight,
    ShoppingBag,
    Edit
} from 'lucide-react';
import './perfil.css';

export default function PerfilPage() {
    const { user, logout } = useUser();
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

    if (!user) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <div className="perfil-empty">
                        <User size={64} strokeWidth={1} />
                        <h1>No has iniciado sesión</h1>
                        <p>Para ver tu perfil y pedidos, primero realiza una compra.</p>
                        <Link href="/tienda" className="btn-primary">
                            <ShoppingBag size={18} />
                            Ir a la tienda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'confirmed': return <CheckCircle size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <Check size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'confirmed': return 'Confirmado';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregado';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            default: return '';
        }
    };

    return (
        <div className="perfil-page">
            <div className="container">
                <div className="perfil-grid">
                    {/* Sidebar */}
                    <aside className="perfil-sidebar">
                        <div className="user-card">
                            <div className="user-avatar">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <h2>{user.firstName} {user.lastName}</h2>
                            <p>{user.email}</p>
                        </div>

                        <nav className="perfil-nav">
                            <button
                                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={20} />
                                Mis Pedidos
                                <ChevronRight size={18} />
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User size={20} />
                                Mi Perfil
                                <ChevronRight size={18} />
                            </button>
                            <button className="nav-item logout" onClick={logout}>
                                <LogOut size={20} />
                                Cerrar Sesión
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="perfil-content">
                        {activeTab === 'orders' && (
                            <>
                                <h1>Mis Pedidos</h1>

                                {user.orders.length === 0 ? (
                                    <div className="no-orders">
                                        <Package size={48} strokeWidth={1} />
                                        <p>Aún no tienes pedidos</p>
                                        <Link href="/tienda" className="btn-secondary">
                                            Explorar productos
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {user.orders.map((order) => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div className="order-info">
                                                        <span className="order-id">Pedido #{order.id}</span>
                                                        <span className="order-date">
                                                            {new Date(order.date).toLocaleDateString('es-MX', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <span className={`order-status ${getStatusClass(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>

                                                <div className="order-items">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="order-item">
                                                            <div className="item-image">
                                                                {item.image ? (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.productName}
                                                                        width={60}
                                                                        height={60}
                                                                    />
                                                                ) : (
                                                                    <div className="item-placeholder" />
                                                                )}
                                                            </div>
                                                            <div className="item-details">
                                                                <span className="item-name">{item.productName}</span>
                                                                {item.variantName && (
                                                                    <span className="item-variant">{item.variantName}</span>
                                                                )}
                                                                <span className="item-qty">Cantidad: {item.quantity}</span>
                                                            </div>
                                                            <span className="item-price">
                                                                ${(item.price * item.quantity).toLocaleString('es-MX')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="order-footer">
                                                    <div className="order-address">
                                                        <MapPin size={14} />
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}
                                                    </div>
                                                    <div className="order-total">
                                                        Total: <strong>${order.total.toLocaleString('es-MX')}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'profile' && (
                            <>
                                <h1>Mi Perfil</h1>

                                <div className="profile-card">
                                    <div className="profile-section">
                                        <h3>Información Personal</h3>
                                        <div className="profile-fields">
                                            <div className="field">
                                                <label>Nombre</label>
                                                <span>{user.firstName} {user.lastName}</span>
                                            </div>
                                            <div className="field">
                                                <label>Email</label>
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="field">
                                                <label>Teléfono</label>
                                                <span>{user.phone}</span>
                                            </div>
                                            <div className="field">
                                                <label>Miembro desde</label>
                                                <span>
                                                    {new Date(user.createdAt).toLocaleDateString('es-MX', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-stats">
                                        <div className="stat">
                                            <span className="stat-value">{user.orders.length}</span>
                                            <span className="stat-label">Pedidos realizados</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">
                                                ${user.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('es-MX')}
                                            </span>
                                            <span className="stat-label">Total gastado</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
