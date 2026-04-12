'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    _count: { products: number };
}

export default function CategoriasAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch {
            console.error('Error fetching categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string, productCount: number) => {
        if (productCount > 0) {
            alert(`No se puede eliminar "${name}" porque tiene ${productCount} producto(s) asociado(s).`);
            return;
        }
        if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setDeleting(null);
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <>
                <header className="admin-header"><h1>Categorías</h1></header>
                <div className="admin-content">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto', width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="admin-header">
                <h1>Categorías</h1>
                <div className="header-actions">
                    <Link href="/admin/categorias/nueva" className="btn-admin primary">
                        <Plus size={18} />
                        Nueva Categoría
                    </Link>
                </div>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todas las categorías ({filtered.length})</h2>
                        <div className="table-actions">
                            <div className="search-input">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar categorías..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Slug</th>
                                <th>Productos</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="stat-card-icon green" style={{ width: 40, height: 40 }}>
                                                <FolderOpen size={20} />
                                            </div>
                                            <div className="product-info">
                                                <h4>{category.name}</h4>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code style={{
                                            background: '#f1f5f9',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 4,
                                            fontSize: '0.813rem'
                                        }}>
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td>
                                        <span className="status-badge active">
                                            {category._count.products} productos
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {category.description || '-'}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <Link
                                                href={`/admin/categorias/${category.id}`}
                                                className="action-btn"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                className="action-btn delete"
                                                title="Eliminar"
                                                onClick={() => handleDelete(category.id, category.name, category._count.products)}
                                                disabled={deleting === category.id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                {search ? 'No se encontraron categorías' : 'No hay categorías aún'}
                            </p>
                            {!search && (
                                <Link href="/admin/categorias/nueva" className="btn-admin primary">
                                    <Plus size={18} />
                                    Crear primera categoría
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
