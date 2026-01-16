import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

async function getProducts() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            images: {
                orderBy: { position: 'asc' },
                take: 1
            },
            variants: {
                orderBy: { price: 'asc' },
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return products;
}

export default async function ProductosAdmin() {
    const products = await getProducts();

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
                        <h2>Todos los productos ({products.length})</h2>
                        <div className="table-actions">
                            <div className="search-input">
                                <Search size={18} />
                                <input type="text" placeholder="Buscar productos..." />
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
                            {products.map((product: any) => (
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
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                No hay productos aún
                            </p>
                            <Link href="/admin/productos/nuevo" className="btn-admin primary">
                                <Plus size={18} />
                                Crear primer producto
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
