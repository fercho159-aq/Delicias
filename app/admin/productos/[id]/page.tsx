'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2, ImageIcon, Package } from 'lucide-react';
import Link from 'next/link';
import '../../forms.css';

interface Variant {
    name: string;
    price: number | string;
    salePrice: number | string;
    weight: string;
    stock: number | string;
}

interface ProductImage {
    url: string;
    alt: string;
}

interface Category {
    id: number;
    name: string;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const emptyVariant: Variant = {
    name: '',
    price: '',
    salePrice: '',
    weight: '',
    stock: 0,
};

export default function ProductoFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isNew = id === 'nuevo';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [type, setType] = useState('SIMPLE');
    const [featured, setFeatured] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([{ ...emptyVariant }]);
    const [images, setImages] = useState<ProductImage[]>([]);

    // Fetch categories
    useEffect(() => {
        fetch('/api/admin/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            })
            .catch(() => {});
    }, []);

    // Fetch product data if editing
    const fetchProduct = useCallback(async () => {
        if (isNew) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`);
            if (!res.ok) {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Error al cargar el producto' });
                return;
            }
            const product = await res.json();
            setName(product.name || '');
            setSlug(product.slug || '');
            setDescription(product.description || '');
            setCategoryId(product.categoryId ? String(product.categoryId) : '');
            setStatus(product.status || 'ACTIVE');
            setType(product.type || 'SIMPLE');
            setFeatured(product.featured || false);
            if (product.variants && product.variants.length > 0) {
                setVariants(
                    product.variants.map((v: Record<string, unknown>) => ({
                        name: v.name || '',
                        price: v.price !== undefined ? Number(v.price) : '',
                        salePrice: v.salePrice !== null && v.salePrice !== undefined ? Number(v.salePrice) : '',
                        weight: v.weight || '',
                        stock: v.stock !== undefined ? Number(v.stock) : 0,
                    }))
                );
            }
            if (product.images && product.images.length > 0) {
                setImages(
                    product.images.map((img: Record<string, unknown>) => ({
                        url: img.url || '',
                        alt: img.alt || '',
                    }))
                );
            }
            setSlugManuallyEdited(true);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al cargar el producto' });
        } finally {
            setLoading(false);
        }
    }, [id, isNew]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

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

    // Variant handlers
    const addVariant = () => {
        setVariants(prev => [...prev, { ...emptyVariant }]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        setVariants(prev =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        );
    };

    // Image handlers
    const addImage = () => {
        setImages(prev => [...prev, { url: '', alt: '' }]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const updateImage = (index: number, field: keyof ProductImage, value: string) => {
        setImages(prev =>
            prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
        );
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

        // Validation
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'El nombre del producto es requerido' });
            return;
        }
        if (!slug.trim()) {
            setMessage({ type: 'error', text: 'El slug es requerido' });
            return;
        }

        // Validate variants have at least name and price
        const validVariants = variants.filter(v => v.name.trim() && v.price !== '' && v.price !== null);
        if (validVariants.length === 0) {
            setMessage({ type: 'error', text: 'Agrega al menos una variante con nombre y precio' });
            return;
        }

        setSaving(true);
        setMessage(null);

        const body = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            categoryId: categoryId ? Number(categoryId) : null,
            status,
            type,
            featured,
            variants: validVariants.map(v => ({
                name: v.name.trim(),
                price: Number(v.price),
                salePrice: v.salePrice !== '' && v.salePrice !== null ? Number(v.salePrice) : null,
                weight: v.weight.trim() || null,
                stock: Number(v.stock) || 0,
            })),
            images: images.filter(img => img.url.trim()).map(img => ({
                url: img.url.trim(),
                alt: img.alt.trim() || null,
            })),
        };

        try {
            const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al guardar el producto' });
                return;
            }

            setMessage({ type: 'success', text: isNew ? 'Producto creado correctamente' : 'Producto actualizado correctamente' });
            setTimeout(() => {
                router.push('/admin/productos');
            }, 1000);
        } catch {
            setMessage({ type: 'error', text: 'Error de conexion al guardar' });
        } finally {
            setSaving(false);
        }
    };

    // Delete product
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Error al eliminar el producto' });
                setShowDeleteConfirm(false);
                return;
            }

            setMessage({ type: 'success', text: 'Producto eliminado correctamente' });
            setTimeout(() => {
                router.push('/admin/productos');
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
                        <Link href="/admin/productos" className="back-link">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Cargando producto...</h1>
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
                    <Link href="/admin/productos" className="back-link">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1>{isNew ? 'Nuevo Producto' : 'Editar Producto'}</h1>
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
                        {saving ? 'Guardando...' : 'Guardar Producto'}
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
                            ¿Estas seguro de que deseas eliminar este producto? Esta accion no se puede deshacer.
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
                            <h2><Package size={18} /> Informacion General</h2>
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
                                        placeholder="Nombre del producto"
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
                                        placeholder="slug-del-producto"
                                        required
                                    />
                                    <div className="field-hint">
                                        Se usa en la URL del producto
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Descripcion</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Descripcion detallada del producto..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Categoria</label>
                                    <select
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Sin categoria</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Estado</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        <option value="ACTIVE">Activo</option>
                                        <option value="INACTIVE">Inactivo</option>
                                        <option value="DRAFT">Borrador</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Tipo</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value="SIMPLE">Simple</option>
                                        <option value="VARIABLE">Variable</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ display: 'flex', alignItems: 'end' }}>
                                    <div className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={featured}
                                            onChange={e => setFeatured(e.target.checked)}
                                        />
                                        <label htmlFor="featured">Producto destacado</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2><Package size={18} /> Variantes</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="variant-list">
                                {variants.map((variant, index) => (
                                    <div key={index} className="variant-card">
                                        <div className="variant-card-header">
                                            <span>Variante {index + 1}</span>
                                            {variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    title="Eliminar variante"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="variant-fields">
                                            <div className="form-field">
                                                <label>Nombre <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    value={variant.name}
                                                    onChange={e => updateVariant(index, 'name', e.target.value)}
                                                    placeholder="Ej: 500g, 1kg"
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Precio <span className="required">*</span></label>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={e => updateVariant(index, 'price', e.target.value)}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Precio oferta</label>
                                                <input
                                                    type="number"
                                                    value={variant.salePrice}
                                                    onChange={e => updateVariant(index, 'salePrice', e.target.value)}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Peso</label>
                                                <input
                                                    type="text"
                                                    value={variant.weight}
                                                    onChange={e => updateVariant(index, 'weight', e.target.value)}
                                                    placeholder="Ej: 500g"
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Stock</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={e => updateVariant(index, 'stock', e.target.value)}
                                                    placeholder="0"
                                                    min="0"
                                                    step="1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="add-item-btn"
                                onClick={addVariant}
                            >
                                <Plus size={16} />
                                Agregar variante
                            </button>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2><ImageIcon size={18} /> Imagenes</h2>
                        </div>
                        <div className="form-card-body">
                            <div className="image-list">
                                {images.map((image, index) => (
                                    <div key={index} className="image-item">
                                        <div className="image-item-preview">
                                            {image.url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={image.url}
                                                    alt={image.alt || 'Preview'}
                                                    onError={e => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon size={20} />
                                            )}
                                        </div>
                                        <input
                                            type="url"
                                            value={image.url}
                                            onChange={e => updateImage(index, 'url', e.target.value)}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            title="Eliminar imagen"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="add-item-btn"
                                onClick={addImage}
                            >
                                <Plus size={16} />
                                Agregar imagen
                            </button>
                            {images.length === 0 && (
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    No hay imagenes. Agrega URLs de imagenes para el producto.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions (bottom sticky bar) */}
                    <div className="form-card" style={{ padding: 0, marginBottom: 0 }}>
                        <div className="form-actions">
                            <div className="form-actions-left">
                                <Link href="/admin/productos" className="btn-admin secondary">
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
                                    {saving ? 'Guardando...' : 'Guardar Producto'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
