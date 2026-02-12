'use client';
import { useState, useEffect } from 'react';
import { Save, Settings, Phone, Truck, Store } from 'lucide-react';
import '../forms.css';

interface ConfigItem {
    key: string;
    label: string;
    value: string;
    hint: string;
    icon: React.ReactNode;
    type: string;
}

const CONFIG_FIELDS: Omit<ConfigItem, 'value'>[] = [
    {
        key: 'store_name',
        label: 'Nombre de la Tienda',
        hint: 'El nombre que aparece en el sitio',
        icon: <Store size={18} />,
        type: 'text',
    },
    {
        key: 'whatsapp_number',
        label: 'Número de WhatsApp',
        hint: 'Número completo con código de país (ej: 5215519915154)',
        icon: <Phone size={18} />,
        type: 'text',
    },
    {
        key: 'shipping_cost',
        label: 'Costo de Envío',
        hint: 'Costo de envío estándar en pesos',
        icon: <Truck size={18} />,
        type: 'number',
    },
    {
        key: 'free_shipping_threshold',
        label: 'Envío Gratis desde',
        hint: 'Monto mínimo para envío gratis en pesos',
        icon: <Truck size={18} />,
        type: 'number',
    },
];

const DEFAULTS: Record<string, string> = {
    whatsapp_number: '5215519915154',
    shipping_cost: '150',
    free_shipping_threshold: '999',
    store_name: 'Las Delicias del Campo',
};

export default function ConfiguracionAdmin() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/config');
            if (!res.ok) {
                setMessage({ type: 'error', text: 'Error al cargar la configuración' });
                return;
            }
            const data = await res.json();
            const configMap: Record<string, string> = {};
            for (const item of data) {
                configMap[item.key] = item.value;
            }
            // Fill defaults for missing keys
            for (const field of CONFIG_FIELDS) {
                if (!configMap[field.key]) {
                    configMap[field.key] = DEFAULTS[field.key] || '';
                }
            }
            setConfigs(configMap);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const configsArray = CONFIG_FIELDS.map(field => ({
                key: field.key,
                value: configs[field.key] || DEFAULTS[field.key] || '',
                type: field.type === 'number' ? 'number' : 'text',
            }));

            const res = await fetch('/api/admin/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ configs: configsArray }),
            });

            if (!res.ok) {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Error al guardar' });
                return;
            }

            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión al guardar' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <h1>Configuración</h1>
                </header>
                <div className="admin-content">
                    <div className="loading-spinner"><div className="spinner" /></div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="admin-header">
                <h1>Configuración</h1>
                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-admin primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {message && (
                    <div className={`form-message ${message.type}`}>{message.text}</div>
                )}

                <div className="form-card">
                    <div className="form-card-header">
                        <h2><Settings size={18} /> Configuración General</h2>
                    </div>
                    <div className="form-card-body">
                        {CONFIG_FIELDS.map((field) => (
                            <div className="form-field" key={field.key}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {field.icon}
                                    {field.label}
                                </label>
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={configs[field.key] || ''}
                                    onChange={e => setConfigs(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    placeholder={DEFAULTS[field.key]}
                                    min={field.type === 'number' ? '0' : undefined}
                                />
                                <div className="field-hint">{field.hint}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button at bottom too */}
                <div className="form-card" style={{ padding: 0, marginBottom: 0 }}>
                    <div className="form-actions">
                        <div className="form-actions-left" />
                        <div className="form-actions-right">
                            <button
                                type="button"
                                className="btn-admin primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <Save size={16} />
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
