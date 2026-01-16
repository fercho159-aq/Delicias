import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react';

async function getCategories() {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    });
    return categories;
}

export default async function CategoriasAdmin() {
    const categories = await getCategories();

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
                        <h2>Todas las categorías ({categories.length})</h2>
                        <div className="table-actions">
                            <div className="search-input">
                                <Search size={18} />
                                <input type="text" placeholder="Buscar categorías..." />
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
                            {categories.map((category: any) => (
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
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {categories.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                No hay categorías aún
                            </p>
                            <Link href="/admin/categorias/nueva" className="btn-admin primary">
                                <Plus size={18} />
                                Crear primera categoría
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
