import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Completa tu compra de nueces, semillas y frutos secos. Pago seguro con Mercado Pago, WhatsApp o transferencia.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
