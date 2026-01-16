'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
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
    ShoppingCart
} from 'lucide-react';
import './membresias.css';

const plans = [
    {
        id: 'membresia-basico',
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
        id: 'membresia-premium',
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
        id: 'membresia-familiar',
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

export default function MembresiasPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [addedPlan, setAddedPlan] = useState<string | null>(null);
    const { addItem } = useCart();

    const handleAddToCart = (plan: typeof plans[0], isAnnualPlan: boolean) => {
        const price = isAnnualPlan ? plan.annualPrice : plan.monthlyPrice;
        const period = isAnnualPlan ? 'Anual' : 'Mensual';
        const variantId = parseInt(plan.id.replace('membresia-', '').charCodeAt(0).toString() + (isAnnualPlan ? '1' : '0'));

        addItem({
            variantId: variantId,
            productId: 90000 + variantId, // Special ID range for memberships
            productName: `Membresía ${plan.name}`,
            productSlug: 'membresias',
            variantName: period,
            price: price,
            quantity: 1,
            image: '/membership-hero.png',
            maxStock: 999
        });

        setAddedPlan(plan.id);
        setTimeout(() => setAddedPlan(null), 2000);
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

                    {/* Plans Grid */}
                    <div className="plans-grid">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                            const isAdded = addedPlan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    className={`plan-card ${plan.featured ? 'featured' : ''}`}
                                >
                                    {plan.featured && (
                                        <div className="plan-badge">Más Popular</div>
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
                                                {isAnnual
                                                    ? Math.round(price / 12).toLocaleString('es-MX')
                                                    : price.toLocaleString('es-MX')
                                                }
                                            </span>
                                            <span className="period">/mes</span>
                                        </div>
                                        {isAnnual && (
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
                                        onClick={() => handleAddToCart(plan, isAnnual)}
                                        className={`plan-cta ${plan.featured ? 'primary' : 'secondary'} ${isAdded ? 'added' : ''}`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={18} />
                                                ¡Agregado al carrito!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                Agregar al carrito
                                            </>
                                        )}
                                    </button>
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
