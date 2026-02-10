'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';
import {
    Sparkles,
    Package,
    Crown,
    Check,
    Truck,
    Percent,
    Gift,
    RefreshCw,
    Calendar,
    Heart,
    Shield,
    MessageCircle,
    ChevronDown,
    Star,
    CreditCard,
    Loader2,
    FlaskConical
} from 'lucide-react';
import './membresias.css';

const plans = [
    {
        id: 'basico',
        name: 'Básico',
        description: 'Perfecto para empezar',
        icon: Package,
        monthlyPrice: 499,
        annualPrice: 4990,
        savings: '2 meses gratis',
        features: [
            'Caja mensual con 4 productos',
            'Productos seleccionados del mes',
            'Envío gratis a todo México',
            'Descuento 10% en tienda online',
            'Acceso a promociones exclusivas',
        ],
        featured: false,
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'El favorito de nuestros clientes',
        icon: Sparkles,
        monthlyPrice: 799,
        annualPrice: 7990,
        savings: '2 meses gratis',
        features: [
            'Caja mensual con 6 productos',
            'Incluye productos premium y edición limitada',
            'Envío gratis prioritario',
            'Descuento 15% en tienda online',
            'Acceso anticipado a nuevos productos',
            'Recetas y tips de uso exclusivos',
            'Atención prioritaria por WhatsApp',
        ],
        featured: true,
    },
    {
        id: 'familiar',
        name: 'Familiar',
        description: 'Para toda la familia',
        icon: Crown,
        monthlyPrice: 1199,
        annualPrice: 11990,
        savings: '2 meses gratis',
        features: [
            'Caja mensual con 10 productos',
            'Variedad para todos los gustos',
            'Incluye snacks para niños',
            'Envío gratis express',
            'Descuento 20% en tienda online',
            'Regalo sorpresa cada trimestre',
            'Caja personalizable',
            'Consultoría nutricional básica',
        ],
        featured: false,
    },
    {
        id: 'test',
        name: 'Prueba',
        description: 'Plan de prueba - facturación diaria',
        icon: FlaskConical,
        monthlyPrice: 1,
        annualPrice: 1,
        savings: '',
        isTest: true,
        features: [
            'Facturación diaria de $1 MXN',
            'Solo para pruebas de sandbox',
            'Verificar cobros recurrentes',
        ],
        featured: false,
    },
];

const benefits = [
    {
        icon: Truck,
        title: 'Envío Gratis Siempre',
        description: 'Todas las suscripciones incluyen envío gratis a cualquier parte de México.'
    },
    {
        icon: Percent,
        title: 'Descuentos Exclusivos',
        description: 'Accede a precios especiales en toda la tienda según tu plan.'
    },
    {
        icon: Gift,
        title: 'Regalos Sorpresa',
        description: 'Recibe productos exclusivos y ediciones limitadas solo para suscriptores.'
    },
    {
        icon: RefreshCw,
        title: 'Cancela Cuando Quieras',
        description: 'Sin compromisos, puedes pausar o cancelar tu suscripción en cualquier momento.'
    },
    {
        icon: Calendar,
        title: 'Entrega Puntual',
        description: 'Tu caja llega a tu puerta entre el 1 y 5 de cada mes.'
    },
    {
        icon: Heart,
        title: 'Productos Seleccionados',
        description: 'Cada caja es curada con los mejores productos de temporada.'
    },
];

const faqs = [
    {
        question: '¿Cuándo recibiré mi primera caja?',
        answer: 'Si te suscribes antes del día 25 del mes, recibirás tu primera caja entre el 1 y 5 del siguiente mes. Si te suscribes después del 25, tu primera caja llegará el mes siguiente.'
    },
    {
        question: '¿Puedo cambiar de plan después de suscribirme?',
        answer: 'Sí, puedes cambiar tu plan en cualquier momento desde tu cuenta. El cambio se aplicará en tu siguiente renovación.'
    },
    {
        question: '¿Cómo puedo cancelar mi suscripción?',
        answer: 'Puedes cancelar tu suscripción en cualquier momento desde tu cuenta o contactándonos por WhatsApp. No hay penalizaciones ni cargos ocultos.'
    },
    {
        question: '¿Qué productos vienen en cada caja?',
        answer: 'Cada caja incluye una selección de nueces, semillas, frutos secos y snacks saludables. Los productos varían cada mes para que siempre tengas algo nuevo que probar.'
    },
    {
        question: '¿Puedo personalizar mi caja?',
        answer: 'El plan Familiar incluye la opción de personalizar tu caja. En los otros planes, puedes indicar alergias o preferencias y las tomaremos en cuenta.'
    },
];

const PLAN_LABELS: Record<string, string> = {
    BASICO: 'Básico',
    PREMIUM: 'Premium',
    FAMILIAR: 'Familiar',
    TEST: 'Prueba',
};

export default function MembresiasPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const { user } = useUser();

    const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<{
        plan: string;
        billingCycle: string;
        status: string;
        price: number;
    } | null>(null);
    const [showEmailForm, setShowEmailForm] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [error, setError] = useState<string | null>(null);

    // Check for existing subscription when user is available
    useEffect(() => {
        if (user?.email) {
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            });
            fetch(`/api/subscriptions/status?email=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.subscription) {
                        setCurrentSubscription(data.subscription);
                    }
                })
                .catch(() => {});
        }
    }, [user]);

    const handleSubscribe = async (planId: string) => {
        setError(null);

        // If no user and form not shown yet, show the form
        if (!user && !showEmailForm) {
            setShowEmailForm(planId);
            return;
        }

        // Determine customer data
        const customer = user
            ? { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone }
            : formData;

        if (!customer.email) {
            setError('Por favor ingresa tu email');
            return;
        }

        setIsSubscribing(planId);

        try {
            const res = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: planId,
                    billingCycle: planId === 'test' ? 'daily' : (isAnnual ? 'annual' : 'monthly'),
                    customer,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al crear la suscripción');
                setIsSubscribing(null);
                return;
            }

            if (data.initPoint) {
                window.location.href = data.initPoint;
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
            setIsSubscribing(null);
        }
    };

    const handleFormSubmit = (e: React.FormEvent, planId: string) => {
        e.preventDefault();
        handleSubscribe(planId);
    };

    return (
        <div className="membresias-page">
            {/* Hero */}
            <section className="membresias-hero">
                <div className="container">
                    <div className="hero-badge">
                        <Star size={16} />
                        Suscríbete y Ahorra
                    </div>
                    <h1>
                        Recibe lo mejor del campo<br />
                        <span>cada mes en tu puerta</span>
                    </h1>
                    <p>
                        Únete a nuestra membresía y recibe cajas mensuales con los productos
                        más frescos y deliciosos. Ahorra hasta un 25% con nuestros planes.
                    </p>
                </div>
            </section>

            {/* Active Subscription Banner */}
            {currentSubscription && (
                <section className="subscription-banner">
                    <div className="container">
                        <div className="banner-content">
                            <Shield size={24} />
                            <div>
                                <strong>Tu plan actual: {PLAN_LABELS[currentSubscription.plan] || currentSubscription.plan}</strong>
                                <span>
                                    {currentSubscription.billingCycle === 'ANNUAL' ? 'Anual' : 'Mensual'} · ${currentSubscription.price.toLocaleString('es-MX')}{currentSubscription.billingCycle === 'ANNUAL' ? '/año' : '/mes'}
                                    {currentSubscription.status === 'PENDING' && ' · Pendiente de pago'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Plans */}
            <section className="plans-section">
                <div className="container">
                    {/* Billing Toggle */}
                    <div className="billing-toggle">
                        <span
                            className={`billing-option ${!isAnnual ? 'active' : ''}`}
                            onClick={() => setIsAnnual(false)}
                        >
                            Mensual
                        </span>
                        <div
                            className={`toggle-switch ${isAnnual ? 'active' : ''}`}
                            onClick={() => setIsAnnual(!isAnnual)}
                        >
                            <div className="toggle-knob" />
                        </div>
                        <span
                            className={`billing-option ${isAnnual ? 'active' : ''}`}
                            onClick={() => setIsAnnual(true)}
                        >
                            Anual
                        </span>
                        <span className="annual-badge">Ahorra 2 meses</span>
                    </div>

                    {error && (
                        <div className="subscription-error">
                            {error}
                        </div>
                    )}

                    {/* Plans Grid */}
                    <div className="plans-grid">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const isTestPlan = 'isTest' in plan && plan.isTest;
                            const price = isTestPlan ? 1 : (isAnnual ? plan.annualPrice : plan.monthlyPrice);
                            const isBusy = isSubscribing === plan.id;
                            const hasActiveSub = !!currentSubscription;

                            return (
                                <div
                                    key={plan.id}
                                    className={`plan-card ${plan.featured ? 'featured' : ''} ${isTestPlan ? 'test-plan' : ''}`}
                                >
                                    {plan.featured && (
                                        <div className="plan-badge">Más Popular</div>
                                    )}
                                    {isTestPlan && (
                                        <div className="plan-badge test-badge">Sandbox</div>
                                    )}

                                    <div className="plan-header">
                                        <div className="plan-icon">
                                            <Icon size={32} />
                                        </div>
                                        <h3 className="plan-name">{plan.name}</h3>
                                        <p className="plan-description">{plan.description}</p>
                                    </div>

                                    <div className="plan-pricing">
                                        <div className="plan-price">
                                            <span className="currency">$</span>
                                            <span className="amount">
                                                {isTestPlan
                                                    ? '1'
                                                    : isAnnual
                                                    ? Math.round(price / 12).toLocaleString('es-MX')
                                                    : price.toLocaleString('es-MX')
                                                }
                                            </span>
                                            <span className="period">{isTestPlan ? '/día' : '/mes'}</span>
                                        </div>
                                        {isAnnual && !isTestPlan && (
                                            <div className="plan-savings">
                                                {plan.savings} · ${price.toLocaleString('es-MX')}/año
                                            </div>
                                        )}
                                    </div>

                                    <ul className="plan-features">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <Check size={18} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isBusy || hasActiveSub}
                                        className={`plan-cta ${plan.featured ? 'primary' : 'secondary'} ${isBusy ? 'loading' : ''}`}
                                    >
                                        {isBusy ? (
                                            <>
                                                <Loader2 size={18} className="spinner" />
                                                Redirigiendo a Mercado Pago...
                                            </>
                                        ) : hasActiveSub ? (
                                            currentSubscription?.plan === plan.id.toUpperCase() ? 'Plan actual' : 'Ya tienes una suscripción'
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                Suscribirse
                                            </>
                                        )}
                                    </button>

                                    {/* Inline email form for non-logged-in users */}
                                    {showEmailForm === plan.id && !user && (
                                        <form
                                            className="email-form"
                                            onSubmit={(e) => handleFormSubmit(e, plan.id)}
                                        >
                                            <h4>Ingresa tus datos para continuar</h4>
                                            <div className="email-form-field">
                                                <input
                                                    type="email"
                                                    placeholder="Email *"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="email-form-row">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Apellido"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                />
                                            </div>
                                            <div className="email-form-field">
                                                <input
                                                    type="tel"
                                                    placeholder="Teléfono"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="email-form-submit"
                                                disabled={!!isSubscribing}
                                            >
                                                {isSubscribing === plan.id ? (
                                                    <>
                                                        <Loader2 size={16} className="spinner" />
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    'Continuar a Mercado Pago'
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="benefits-membership">
                <div className="container">
                    <div className="section-header">
                        <h2>¿Por qué suscribirte?</h2>
                        <p>Beneficios exclusivos para nuestros miembros</p>
                    </div>

                    <div className="benefits-grid-membership">
                        {benefits.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={idx} className="benefit-item">
                                    <div className="benefit-icon">
                                        <Icon size={24} />
                                    </div>
                                    <div className="benefit-content">
                                        <h3>{benefit.title}</h3>
                                        <p>{benefit.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <div className="container">
                    <h2>Preguntas Frecuentes</h2>

                    <div className="faq-list">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item">
                                <div
                                    className="faq-question"
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                >
                                    {faq.question}
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    />
                                </div>
                                {openFaq === idx && (
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-membership">
                <div className="container">
                    <h2>¿Tienes dudas?</h2>
                    <p>
                        Estamos aquí para ayudarte. Contáctanos por WhatsApp y
                        te asesoramos para elegir el plan perfecto para ti.
                    </p>
                    <Link
                        href="https://wa.me/5215519915154?text=Hola,%20tengo%20dudas%20sobre%20las%20membresías"
                        target="_blank"
                        className="btn"
                    >
                        <MessageCircle size={20} />
                        Contactar por WhatsApp
                    </Link>
                </div>
            </section>
        </div>
    );
}
