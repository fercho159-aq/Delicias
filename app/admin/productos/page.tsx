'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    status: string;
    type: string;
    category: { name: string } | null;
    images: { url: string }[];
    variants: { price: string | number }[];
}

const ITEMS_PER_PAGE = 20;

export default function ProductosAdmin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch {
            console.error('Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
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

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset to page 1 when search changes
    useEffect(() => { setPage(1); }, [search]);

    if (loading) {
        return (
            <>
                <header className="admin-header"><h1>Productos</h1></header>
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
                <h1>Productos</h1>
                <div className="header-actions">
                    <Link href="/admin/productos/nuevo" className="btn-admin primary">
                        <Plus size={18} />
                        Nuevo Producto
                    </Link>
                </div>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todos los productos ({filtered.length})</h2>
                        <div className="table-actions">
                            <div className="search-input">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="product-thumb"
                                                />
                                            ) : (
                                                <div className="product-thumb" />
                                            )}
                                            <div className="product-info">
                                                <h4>{product.name}</h4>
                                                <span>SKU: {product.sku || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category?.name || 'Sin categoría'}</td>
                                    <td>
                                        {product.variants[0]
                                            ? `$${Number(product.variants[0].price).toLocaleString('es-MX')}`
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.status.toLowerCase()}`}>
                                            {product.status === 'ACTIVE' ? 'Activo' :
                                                product.status === 'INACTIVE' ? 'Inactivo' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td>{product.type === 'VARIABLE' ? 'Variable' : 'Simple'}</td>
                                    <td>
                                        <div className="action-btns">
                                            <Link
                                                href={`/productos/${product.slug}`}
                                                className="action-btn"
                                                target="_blank"
                                                title="Ver en tienda"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <Link
                                                href={`/admin/productos/${product.id}`}
                                                className="action-btn"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                className="action-btn delete"
                                                title="Eliminar"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={deleting === product.id}
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
                                {search ? 'No se encontraron productos' : 'No hay productos aún'}
                            </p>
                            {!search && (
                                <Link href="/admin/productos/nuevo" className="btn-admin primary">
                                    <Plus size={18} />
                                    Crear primer producto
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            borderTop: '1px solid #e2e8f0',
                        }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="action-btn"
                                style={{ opacity: page === 1 ? 0.5 : 1 }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '0.875rem', color: '#64748b', padding: '0 0.75rem' }}>
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="action-btn"
                                style={{ opacity: page === totalPages ? 0.5 : 1 }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
