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
    Mail,
    Lock,
    Shield,
    Eye,
    EyeOff,
    KeyRound,
} from 'lucide-react';
import './perfil.css';

export default function PerfilPage() {
    const router = useRouter();
    const { user, isLoading, login, register, logout, updateProfile } = useUser();
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

    // Login form states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
    const [formError, setFormError] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Set password form (for users without password)
    const [setPasswordForm, setSetPasswordForm] = useState({ password: '', confirmPassword: '' });
    const [setPasswordError, setSetPasswordError] = useState('');
    const [setPasswordSuccess, setSetPasswordSuccess] = useState(false);
    const [settingPassword, setSettingPassword] = useState(false);

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUserLogin = async () => {
        if (!loginForm.email) {
            setFormError('Ingresa tu email');
            return;
        }
        if (!loginForm.password) {
            setFormError('Ingresa tu contraseña');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        const result = await login(loginForm.email, loginForm.password);
        if (!result.success) {
            setFormError(result.error || 'Error al iniciar sesión');
        }
        setIsSubmitting(false);
    };

    const handleUserRegister = async () => {
        if (!registerForm.email || !registerForm.firstName || !registerForm.lastName || !registerForm.password) {
            setFormError('Completa todos los campos obligatorios');
            return;
        }
        if (registerForm.password.length < 8) {
            setFormError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            setFormError('Las contraseñas no coinciden');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        const result = await register({
            email: registerForm.email,
            password: registerForm.password,
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            phone: registerForm.phone || undefined,
        });
        if (!result.success) {
            setFormError(result.error || 'Error al registrar');
        }
        setIsSubmitting(false);
    };

    const handleAdminLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            setFormError('Ingresa email y contraseña');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetPassword = async () => {
        if (!setPasswordForm.password || setPasswordForm.password.length < 8) {
            setSetPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (setPasswordForm.password !== setPasswordForm.confirmPassword) {
            setSetPasswordError('Las contraseñas no coinciden');
            return;
        }

        setSettingPassword(true);
        setSetPasswordError('');
        setSetPasswordSuccess(false);

        const result = await updateProfile({ password: setPasswordForm.password });
        if (result.success) {
            setSetPasswordSuccess(true);
            setSetPasswordForm({ password: '', confirmPassword: '' });
        } else {
            setSetPasswordError(result.error || 'Error al establecer contraseña');
        }
        setSettingPassword(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'confirmed': return <CheckCircle size={16} />;
            case 'processing': return <CheckCircle size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <Check size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'confirmed': return 'Confirmado';
            case 'processing': return 'Procesando';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'processing': return 'status-confirmed';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-pending';
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <div className="login-container" style={{ justifyContent: 'center', minHeight: '50vh' }}>
                        <p style={{ textAlign: 'center', color: '#8b8579' }}>Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Login/Register Form
    if (!user || user.isGuest) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <div className="login-container">
                        <div className="login-card">
                            {/* Tab Selector */}
                            <div className="login-tabs">
                                <button
                                    className={`login-tab ${loginMode === 'user' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('user'); setFormError(''); }}
                                >
                                    <User size={18} />
                                    Usuario
                                </button>
                                <button
                                    className={`login-tab ${loginMode === 'admin' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('admin'); setFormError(''); }}
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
                                        : (showRegister ? 'Completa tus datos para crear una cuenta' : 'Ingresa tu email y contraseña')
                                    }
                                </p>
                            </div>

                            {formError && (
                                <div className="login-error">
                                    {formError}
                                </div>
                            )}

                            {loginMode === 'user' && !showRegister && (
                                <form onSubmit={(e) => { e.preventDefault(); handleUserLogin(); }}>
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

                                    <div className="form-group">
                                        <label htmlFor="password">
                                            <Lock size={16} />
                                            Contraseña
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={loginForm.password}
                                                onChange={handleLoginChange}
                                                placeholder="Tu contraseña"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute', right: '12px', top: '50%',
                                                    transform: 'translateY(-50%)', background: 'none',
                                                    border: 'none', cursor: 'pointer', color: '#8b8579',
                                                    padding: '4px', display: 'flex',
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="login-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </button>
                                </form>
                            )}

                            {loginMode === 'user' && showRegister && (
                                <form onSubmit={(e) => { e.preventDefault(); handleUserRegister(); }}>
                                    <div className="form-group">
                                        <label htmlFor="reg-email">
                                            <Mail size={16} />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="reg-email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleRegisterChange}
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="reg-firstName">Nombre *</label>
                                            <input
                                                type="text"
                                                id="reg-firstName"
                                                name="firstName"
                                                value={registerForm.firstName}
                                                onChange={handleRegisterChange}
                                                placeholder="Juan"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="reg-lastName">Apellido *</label>
                                            <input
                                                type="text"
                                                id="reg-lastName"
                                                name="lastName"
                                                value={registerForm.lastName}
                                                onChange={handleRegisterChange}
                                                placeholder="Pérez"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="reg-phone">Teléfono (opcional)</label>
                                        <input
                                            type="tel"
                                            id="reg-phone"
                                            name="phone"
                                            value={registerForm.phone}
                                            onChange={handleRegisterChange}
                                            placeholder="55 1234 5678"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="reg-password">
                                            <Lock size={16} />
                                            Contraseña *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="reg-password"
                                                name="password"
                                                value={registerForm.password}
                                                onChange={handleRegisterChange}
                                                placeholder="Mínimo 8 caracteres"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute', right: '12px', top: '50%',
                                                    transform: 'translateY(-50%)', background: 'none',
                                                    border: 'none', cursor: 'pointer', color: '#8b8579',
                                                    padding: '4px', display: 'flex',
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="reg-confirmPassword">
                                            <Lock size={16} />
                                            Confirmar Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            id="reg-confirmPassword"
                                            name="confirmPassword"
                                            value={registerForm.confirmPassword}
                                            onChange={handleRegisterChange}
                                            placeholder="Repite tu contraseña"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="login-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                                    </button>
                                </form>
                            )}

                            {loginMode === 'admin' && (
                                <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
                                    <div className="form-group">
                                        <label htmlFor="admin-email">
                                            <Mail size={16} />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="admin-email"
                                            name="email"
                                            value={loginForm.email}
                                            onChange={handleLoginChange}
                                            placeholder="admin@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="admin-password">
                                            <Lock size={16} />
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="admin-password"
                                            name="password"
                                            value={loginForm.password}
                                            onChange={handleLoginChange}
                                            placeholder="Tu contraseña"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="login-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Iniciando sesión...' : 'Acceder al Panel'}
                                    </button>
                                </form>
                            )}

                            {loginMode === 'user' && (
                                <div className="login-footer">
                                    <button
                                        className="login-toggle"
                                        onClick={() => { setShowRegister(!showRegister); setFormError(''); }}
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
                                {(user.firstName || '?').charAt(0)}{(user.lastName || '').charAt(0)}
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
                                                        {order.shippingAddress && (
                                                            <>
                                                                <MapPin size={14} />
                                                                {order.shippingAddress.city}, {order.shippingAddress.state}
                                                            </>
                                                        )}
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

                                    {/* Set password section for users without one */}
                                    {!user.hasPassword && (
                                        <div className="profile-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f0ede8' }}>
                                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <KeyRound size={18} />
                                                Establecer Contraseña
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: '#8b8579', marginBottom: '1rem' }}>
                                                Tu cuenta fue creada durante el checkout. Establece una contraseña para proteger tu cuenta.
                                            </p>

                                            {setPasswordSuccess && (
                                                <div style={{
                                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                                    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem',
                                                    fontSize: '0.875rem', color: '#16a34a'
                                                }}>
                                                    Contraseña establecida correctamente.
                                                </div>
                                            )}
                                            {setPasswordError && (
                                                <div style={{
                                                    background: '#fef2f2', border: '1px solid #fca5a5',
                                                    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem',
                                                    fontSize: '0.875rem', color: '#dc2626'
                                                }}>
                                                    {setPasswordError}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label htmlFor="set-password">Nueva contraseña</label>
                                                    <input
                                                        type="password"
                                                        id="set-password"
                                                        value={setPasswordForm.password}
                                                        onChange={e => setSetPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                                                        placeholder="Mínimo 8 caracteres"
                                                        minLength={8}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label htmlFor="set-confirm-password">Confirmar contraseña</label>
                                                    <input
                                                        type="password"
                                                        id="set-confirm-password"
                                                        value={setPasswordForm.confirmPassword}
                                                        onChange={e => setSetPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        placeholder="Repite tu contraseña"
                                                    />
                                                </div>
                                                <button
                                                    className="login-btn"
                                                    onClick={handleSetPassword}
                                                    disabled={settingPassword}
                                                    style={{ maxWidth: '200px' }}
                                                >
                                                    {settingPassword ? 'Guardando...' : 'Establecer contraseña'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

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
