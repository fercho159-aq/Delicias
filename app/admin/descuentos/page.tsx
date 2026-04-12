import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';

async function getDiscounts() {
    const discounts = await prisma.discount.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return discounts;
}

const typeLabels: Record<string, string> = {
    PERCENTAGE: 'Porcentaje',
    FIXED: 'Monto fijo',
    FREE_SHIPPING: 'Envío gratis',
};

export default async function DescuentosAdmin() {
    const discounts = await getDiscounts();

    return (
        <>
            <header className="admin-header">
                <h1>Descuentos</h1>
                <div className="header-actions">
                    <Link href="/admin/descuentos/nuevo" className="btn-admin primary">
                        <Plus size={18} />
                        Nuevo Descuento
                    </Link>
                </div>
            </header>

            <div className="admin-content">
                <div className="data-table-container">
                    <div className="table-header">
                        <h2>Todos los descuentos ({discounts.length})</h2>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Compra Mínima</th>
                                <th>Usos</th>
                                <th>Estado</th>
                                <th>Vigencia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount: any) => {
                                const isExpired = discount.endDate && new Date(discount.endDate) < new Date();
                                const isActive = discount.active && !isExpired;
                                return (
                                    <tr key={discount.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="stat-card-icon" style={{
                                                    width: 40, height: 40,
                                                    background: isActive ? '#dcfce7' : '#f1f5f9',
                                                    color: isActive ? '#16a34a' : '#64748b',
                                                    borderRadius: 8,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Tag size={20} />
                                                </div>
                                                <div className="product-info">
                                                    <h4>{discount.code}</h4>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{typeLabels[discount.type] || discount.type}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {discount.type === 'PERCENTAGE'
                                                ? `${Number(discount.value)}%`
                                                : discount.type === 'FREE_SHIPPING'
                                                    ? '-'
                                                    : `$${Number(discount.value).toLocaleString('es-MX')}`
                                            }
                                        </td>
                                        <td>
                                            {discount.minPurchase
                                                ? `$${Number(discount.minPurchase).toLocaleString('es-MX')}`
                                                : '-'}
                                        </td>
                                        <td>
                                            {discount.usedCount}{discount.maxUses ? ` / ${discount.maxUses}` : ''}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                                                {isActive ? (
                                                    <><CheckCircle size={14} style={{ marginRight: 4 }} />Activo</>
                                                ) : (
                                                    <><XCircle size={14} style={{ marginRight: 4 }} />{isExpired ? 'Expirado' : 'Inactivo'}</>
                                                )}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.813rem', color: '#64748b' }}>
                                            {discount.startDate
                                                ? new Date(discount.startDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                                                : '∞'
                                            }
                                            {' - '}
                                            {discount.endDate
                                                ? new Date(discount.endDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '∞'
                                            }
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <Link
                                                    href={`/admin/descuentos/${discount.id}`}
                                                    className="action-btn"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {discounts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                No hay descuentos aún
                            </p>
                            <Link href="/admin/descuentos/nuevo" className="btn-admin primary">
                                <Plus size={18} />
                                Crear primer descuento
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
