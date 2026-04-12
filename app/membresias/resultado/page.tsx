'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import '../../checkout/checkout.css';

function ResultadoContent() {
    const searchParams = useSearchParams();

    const status = searchParams.get('status');
    const preapprovalId = searchParams.get('preapproval_id');

    if (status === 'authorized') {
        return (
            <div className="checkout-success">
                <div className="success-icon">
                    <CheckCircle size={64} />
                </div>
                <h1>Suscripción Activada</h1>
                {preapprovalId && (
                    <p className="order-number">ID: {preapprovalId}</p>
                )}
                <p className="success-message">
                    Tu suscripción ha sido activada correctamente. Recibirás tu
                    primera caja entre el 1 y 5 del próximo mes.
                </p>
                <div className="success-actions">
                    <Link href="/" className="btn-primary">
                        Volver al inicio
                    </Link>
                    <Link href="/membresias" className="btn-secondary">
                        Ver mi membresía
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
                <h1>Suscripción Pendiente</h1>
                {preapprovalId && (
                    <p className="order-number">ID: {preapprovalId}</p>
                )}
                <p className="success-message">
                    Tu suscripción está siendo procesada. Te notificaremos cuando
                    se confirme el pago. Esto puede tardar unos minutos.
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
            <h1>Suscripción No Completada</h1>
            <p className="success-message">
                No se pudo completar tu suscripción. Puedes intentar nuevamente
                desde la página de membresías.
            </p>
            <div className="success-actions">
                <Link href="/membresias" className="btn-primary">
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
                        <p>Verificando suscripción...</p>
                    </div>
                }>
                    <ResultadoContent />
                </Suspense>
            </div>
        </div>
    );
}
