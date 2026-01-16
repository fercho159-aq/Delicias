'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
    Mail,
    Lock,
    Shield
} from 'lucide-react';
import './perfil.css';

export default function PerfilPage() {
    const router = useRouter();
    const { user, login, logout } = useUser();
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

    // Login form states
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
    const [loginError, setLoginError] = useState('');
    const [showRegister, setShowRegister] = useState(false);

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUserLogin = () => {
        if (!loginForm.email) {
            setLoginError('Ingresa tu email');
            return;
        }

        if (showRegister && (!loginForm.firstName || !loginForm.lastName)) {
            setLoginError('Completa todos los campos');
            return;
        }

        // For user login, we just create/update the user profile
        login(
            loginForm.email,
            loginForm.firstName || 'Usuario',
            loginForm.lastName || '',
            loginForm.phone || ''
        );
        setLoginError('');
    };

    const handleAdminLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            setLoginError('Ingresa email y contraseña');
            return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginForm.email,
                    password: loginForm.password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            setLoginError(err.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

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

    // Login/Register Form
    if (!user) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <div className="login-container">
                        <div className="login-card">
                            {/* Tab Selector */}
                            <div className="login-tabs">
                                <button
                                    className={`login-tab ${loginMode === 'user' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('user'); setLoginError(''); }}
                                >
                                    <User size={18} />
                                    Usuario
                                </button>
                                <button
                                    className={`login-tab ${loginMode === 'admin' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('admin'); setLoginError(''); }}
                                >
                                    <Shield size={18} />
                                    Administrador
                                </button>
                            </div>

                            <div className="login-header">
                                <h1>{loginMode === 'admin' ? 'Panel de Administración' : (showRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}</h1>
                                <p>
                                    {loginMode === 'admin'
                                        ? 'Ingresa tus credenciales de administrador'
                                        : (showRegister ? 'Completa tus datos para crear una cuenta' : 'Ingresa tu email para continuar')
                                    }
                                </p>
                            </div>

                            {loginError && (
                                <div className="login-error">
                                    {loginError}
                                </div>
                            )}

                            <form onSubmit={(e) => { e.preventDefault(); loginMode === 'admin' ? handleAdminLogin() : handleUserLogin(); }}>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <Mail size={16} />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={loginForm.email}
                                        onChange={handleLoginChange}
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>

                                {loginMode === 'admin' && (
                                    <div className="form-group">
                                        <label htmlFor="password">
                                            <Lock size={16} />
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={loginForm.password}
                                            onChange={handleLoginChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                )}

                                {loginMode === 'user' && showRegister && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="firstName">Nombre</label>
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={loginForm.firstName}
                                                    onChange={handleLoginChange}
                                                    placeholder="Juan"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="lastName">Apellido</label>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={loginForm.lastName}
                                                    onChange={handleLoginChange}
                                                    placeholder="Pérez"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Teléfono (opcional)</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={loginForm.phone}
                                                onChange={handleLoginChange}
                                                placeholder="55 1234 5678"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    className="login-btn"
                                    disabled={isLoggingIn}
                                >
                                    {isLoggingIn ? 'Iniciando sesión...' : (
                                        loginMode === 'admin' ? 'Acceder al Panel' : (showRegister ? 'Crear Cuenta' : 'Continuar')
                                    )}
                                </button>
                            </form>

                            {loginMode === 'user' && (
                                <div className="login-footer">
                                    <button
                                        className="login-toggle"
                                        onClick={() => setShowRegister(!showRegister)}
                                    >
                                        {showRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Primera vez? Crea una cuenta'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="login-info">
                            <h3>Beneficios de tu cuenta</h3>
                            <ul>
                                <li>
                                    <Package size={18} />
                                    Historial de pedidos
                                </li>
                                <li>
                                    <Truck size={18} />
                                    Seguimiento de envíos
                                </li>
                                <li>
                                    <CheckCircle size={18} />
                                    Checkout más rápido
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                                <span>{user.phone || 'No especificado'}</span>
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
