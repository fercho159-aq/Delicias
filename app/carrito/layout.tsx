import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Carrito de Compras',
    description: 'Revisa los productos en tu carrito y procede al checkout en Las Delicias del Campo.',
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
