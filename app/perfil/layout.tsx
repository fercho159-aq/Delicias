import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mi Cuenta',
    description: 'Accede a tu cuenta, revisa tu historial de pedidos y administra tu perfil en Las Delicias del Campo.',
};

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
    return children;
}
