'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import '../checkout.css';

function ResultadoContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();

    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    useEffect(() => {
        if (status === 'success' || status === 'approved') {
            clearCart();
        }
    }, [status, clearCart]);

    if (status === 'success' || status === 'approved') {
        return (
            <div className="checkout-success">
                <div className="success-icon">
                    <CheckCircle size={64} />
                </div>
                <h1>Pago Exitoso</h1>
                {externalReference && (
                    <p className="order-number">Pedido #{externalReference}</p>
                )}
                <p className="success-message">
                    Tu pago ha sido procesado correctamente. Te contactaremos
                    pronto para coordinar el envio de tu pedido.
                </p>
                <div className="success-actions">
                    <Link href="/" className="btn-primary">
                        Volver al inicio
                    </Link>
                    <Link href="/productos" className="btn-secondary">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="checkout-success">
                <div className="success-icon" style={{ color: '#f59e0b' }}>
                    <Clock size={64} />
                </div>
                <h1>Pago Pendiente</h1>
                {externalReference && (
                    <p className="order-number">Pedido #{externalReference}</p>
                )}
                <p className="success-message">
                    Tu pago esta siendo procesado. Te notificaremos cuando se
                    confirme. Esto puede tardar unos minutos.
                </p>
                <div className="success-actions">
                    <Link href="/" className="btn-primary">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-success">
            <div className="success-icon" style={{ color: '#ef4444' }}>
                <XCircle size={64} />
            </div>
            <h1>Pago No Completado</h1>
            {externalReference && (
                <p className="order-number">Pedido #{externalReference}</p>
            )}
            <p className="success-message">
                No se pudo procesar tu pago. Puedes intentar nuevamente o
                elegir otro metodo de pago.
            </p>
            <div className="success-actions">
                <Link href="/checkout" className="btn-primary">
                    Intentar de nuevo
                </Link>
                <Link href="/" className="btn-secondary">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

export default function ResultadoPage() {
    return (
        <div className="checkout-page">
            <div className="container">
                <Suspense fallback={
                    <div className="checkout-success">
                        <p>Verificando pago...</p>
                    </div>
                }>
                    <ResultadoContent />
                </Suspense>
            </div>
        </div>
    );
}
