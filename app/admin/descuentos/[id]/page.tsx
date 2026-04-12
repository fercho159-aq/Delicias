'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Trash2, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import '../../forms.css';

export default function DescuentoFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isNew = id === 'nuevo';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [type, setType] = useState('PERCENTAGE');
    const [value, setValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [active, setActive] = useState(true);
    const [usedCount, setUsedCount] = useState(0);

    const fetchDiscount = useCallback(async () => {
        if (isNew) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/discounts/${id}`);
            if (!res.ok) {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Error al cargar el descuento' });
                return;
            }
            const discount = await res.json();
            setCode(discount.code || '');
            setType(discount.type || 'PERCENTAGE');
            setValue(discount.value ? String(Number(discount.value)) : '');
            setMinPurchase(discount.minPurchase ? String(Number(discount.minPurchase)) : '');
            setMaxUses(discount.maxUses ? String(discount.maxUses) : '');
            setStartDate(discount.startDate ? discount.startDate.split('T')[0] : '');
            setEndDate(discount.endDate ? discount.endDate.split('T')[0] : '');
            setActive(discount.active);
            setUsedCount(discount.usedCount || 0);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al cargar el descuento' });
        } finally {
            setLoading(false);
        }
    }, [id, isNew]);

    useEffect(() => {
        fetchDiscount();
    }, [fetchDiscount]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            setMessage({ type: 'error', text: 'El código de descuento es requerido' });
            return;
        }
        if (type !== 'FREE_SHIPPING' && (!value || Number(value) <= 0)) {
            setMessage({ type: 'error', text: 'El valor del descuento es requerido' });
            return;
        }
        if (type === 'PERCENTAGE' && Number(value) > 100) {
            setMessage({ type: 'error', text: 'El porcentaje no puede ser mayor a 100' });
            return;
        }

        setSaving(true);
        setMessage(null);

        const body: Record<string, unknown> = {
            code: code.trim().toUpperCase(),
            type,
            value: type === 'FREE_SHIPPING' ? 0 : Number(value),
            minPurchase: minPurchase ? Number(minPurchase) : null,
            maxUses: maxUses ? Number(maxUses) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            active,
        };

        try {
            const url = isNew ? '/api/admin/discounts' : `/api/admin/discounts/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al guardar el descuento' });
                return;
            }

            setMessage({ type: 'success', text: isNew ? 'Descuento creado correctamente' : 'Descuento actualizado correctamente' });
            setTimeout(() => {
                router.push('/admin/descuentos');
            }, 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al guardar' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al eliminar el descuento' });
                setShowDeleteConfirm(false);
                return;
            }

            setMessage({ type: 'success', text: 'Descuento eliminado correctamente' });
            setTimeout(() => {
                router.push('/admin/descuentos');
            }, 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al eliminar' });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <div className="form-page-header">
                        <Link href="/admin/descuentos" className="back-link">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Cargando descuento...</h1>
                    </div>
                </header>
                <div className="admin-content">
                    <div className="form-card">
                        <div className="form-card-body form-skeleton">
                            <div className="skeleton-line short" />
                            <div className="skeleton-input" />
                            <div className="skeleton-line short" />
                            <div className="skeleton-input" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="admin-header">
                <div className="form-page-header">
                    <Link href="/admin/descuentos" className="back-link">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1>{isNew ? 'Nuevo Descuento' : 'Editar Descuento'}</h1>
                </div>
                <div className="header-actions">
                    {!isNew && (
                        <button
                            type="button"
                            className="btn-admin danger"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleting}
                        >
                            <Trash2 size={16} />
                            Eliminar
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn-admin primary"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Guardando...' : 'Guardar Descuento'}
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {message && (
                    <div className={`form-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {showDeleteConfirm && (
                    <div className="delete-confirm">
                        <p>
                            ¿Estás seguro de que deseas eliminar este descuento?
                            {usedCount > 0 && (
                                <strong> Ha sido usado {usedCount} vez(es).</strong>
                            )}
                            {' '}Esta acción no se puede deshacer.
                        </p>
                        <div className="delete-confirm-actions">
                            <button
                                type="button"
                                className="btn-admin secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-admin danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Eliminando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2><Tag size={18} /> Información del Descuento</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Código <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        placeholder="Ej: BIENVENIDO10"
                                        required
                                    />
                                    <div className="field-hint">
                                        El código que el cliente usará en el checkout
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>
                                        Tipo <span className="required">*</span>
                                    </label>
                                    <select value={type} onChange={e => setType(e.target.value)}>
                                        <option value="PERCENTAGE">Porcentaje</option>
                                        <option value="FIXED">Monto fijo</option>
                                        <option value="FREE_SHIPPING">Envío gratis</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Valor {type !== 'FREE_SHIPPING' && <span className="required">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                        placeholder={type === 'PERCENTAGE' ? 'Ej: 10' : 'Ej: 50'}
                                        min="0"
                                        max={type === 'PERCENTAGE' ? '100' : undefined}
                                        step="0.01"
                                        disabled={type === 'FREE_SHIPPING'}
                                    />
                                    <div className="field-hint">
                                        {type === 'PERCENTAGE' ? 'Porcentaje de descuento (1-100)' :
                                            type === 'FIXED' ? 'Monto en pesos mexicanos' :
                                                'No aplica para envío gratis'}
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Compra Mínima</label>
                                    <input
                                        type="number"
                                        value={minPurchase}
                                        onChange={e => setMinPurchase(e.target.value)}
                                        placeholder="Ej: 500"
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="field-hint">
                                        Monto mínimo de compra para aplicar (opcional)
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Máximo de usos</label>
                                    <input
                                        type="number"
                                        value={maxUses}
                                        onChange={e => setMaxUses(e.target.value)}
                                        placeholder="Sin límite"
                                        min="0"
                                    />
                                    <div className="field-hint">
                                        Número máximo de veces que puede usarse (vacío = ilimitado)
                                        {!isNew && ` — Usado ${usedCount} vez(es)`}
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Estado</label>
                                    <select value={active ? 'true' : 'false'} onChange={e => setActive(e.target.value === 'true')}>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2><Calendar size={18} /> Vigencia</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Fecha de inicio</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                    <div className="field-hint">
                                        Dejar vacío para que sea válido desde ahora
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Fecha de expiración</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                    <div className="field-hint">
                                        Dejar vacío para que no expire
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-card" style={{ padding: 0, marginBottom: 0 }}>
                        <div className="form-actions">
                            <div className="form-actions-left">
                                <Link href="/admin/descuentos" className="btn-admin secondary">
                                    <ArrowLeft size={16} />
                                    Volver
                                </Link>
                            </div>
                            <div className="form-actions-right">
                                {!isNew && (
                                    <button
                                        type="button"
                                        className="btn-admin danger"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={deleting}
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn-admin primary"
                                    disabled={saving}
                                >
                                    <Save size={16} />
                                    {saving ? 'Guardando...' : 'Guardar Descuento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
