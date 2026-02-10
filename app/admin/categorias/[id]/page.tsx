'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Trash2, FolderOpen, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import '../../forms.css';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function CategoriaFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isNew = id === 'nueva';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [productCount, setProductCount] = useState(0);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');

    // Fetch category data if editing
    const fetchCategory = useCallback(async () => {
        if (isNew) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${id}`);
            if (!res.ok) {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Error al cargar la categoria' });
                return;
            }
            const category = await res.json();
            setName(category.name || '');
            setSlug(category.slug || '');
            setDescription(category.description || '');
            setImage(category.image || '');
            setProductCount(category._count?.products || 0);
            setSlugManuallyEdited(true);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al cargar la categoria' });
        } finally {
            setLoading(false);
        }
    }, [id, isNew]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slugManuallyEdited && name) {
            setSlug(generateSlug(name));
        }
    }, [name, slugManuallyEdited]);

    const handleSlugChange = (value: string) => {
        setSlugManuallyEdited(true);
        setSlug(value);
    };

    // Clear message after 5s
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setMessage({ type: 'error', text: 'El nombre de la categoria es requerido' });
            return;
        }
        if (!slug.trim()) {
            setMessage({ type: 'error', text: 'El slug es requerido' });
            return;
        }

        setSaving(true);
        setMessage(null);

        const body = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            image: image.trim() || null,
        };

        try {
            const url = isNew ? '/api/admin/categories' : `/api/admin/categories/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al guardar la categoria' });
                return;
            }

            setMessage({ type: 'success', text: isNew ? 'Categoria creada correctamente' : 'Categoria actualizada correctamente' });
            setTimeout(() => {
                router.push('/admin/categorias');
            }, 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al guardar' });
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al eliminar la categoria' });
                setShowDeleteConfirm(false);
                return;
            }

            setMessage({ type: 'success', text: 'Categoria eliminada correctamente' });
            setTimeout(() => {
                router.push('/admin/categorias');
            }, 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al eliminar' });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <div className="form-page-header">
                        <Link href="/admin/categorias" className="back-link">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Cargando categoria...</h1>
                    </div>
                </header>
                <div className="admin-content">
                    <div className="form-card">
                        <div className="form-card-body form-skeleton">
                            <div className="skeleton-line short" />
                            <div className="skeleton-input" />
                            <div className="skeleton-line short" />
                            <div className="skeleton-input" />
                            <div className="skeleton-line short" />
                            <div className="skeleton-textarea" />
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
                    <Link href="/admin/categorias" className="back-link">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1>{isNew ? 'Nueva Categoria' : 'Editar Categoria'}</h1>
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
                        {saving ? 'Guardando...' : 'Guardar Categoria'}
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
                            ¿Estas seguro de que deseas eliminar esta categoria?
                            {productCount > 0 && (
                                <strong> Tiene {productCount} producto(s) asociado(s).</strong>
                            )}
                            {' '}Esta accion no se puede deshacer.
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
                            <h2><FolderOpen size={18} /> Informacion de la Categoria</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Nombre <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Nombre de la categoria"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label>
                                        Slug <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={e => handleSlugChange(e.target.value)}
                                        placeholder="slug-de-la-categoria"
                                        required
                                    />
                                    <div className="field-hint">
                                        Se usa en la URL de la categoria
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Descripcion</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Descripcion de la categoria..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2><ImageIcon size={18} /> Imagen</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="form-field">
                                <label>URL de imagen</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="url"
                                            value={image}
                                            onChange={e => setImage(e.target.value)}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                        <div className="field-hint">
                                            URL de la imagen de la categoria
                                        </div>
                                    </div>
                                    {image && (
                                        <div style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 8,
                                            border: '1px solid #e2e8f0',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                        }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={e => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-card" style={{ padding: 0, marginBottom: 0 }}>
                        <div className="form-actions">
                            <div className="form-actions-left">
                                <Link href="/admin/categorias" className="btn-admin secondary">
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
                                    {saving ? 'Guardando...' : 'Guardar Categoria'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
