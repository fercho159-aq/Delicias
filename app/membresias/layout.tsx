import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Membresías',
    description: 'Suscríbete a nuestras membresías y recibe tus nueces, semillas y frutos secos favoritos cada mes con descuentos exclusivos.',
};

export default function MembresiasLayout({ children }: { children: React.ReactNode }) {
    return children;
}
