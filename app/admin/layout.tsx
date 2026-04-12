import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';
import './admin.css';

export const metadata = {
    title: 'Admin | Las Delicias del Campo',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    // If not logged in and not on login page, redirect to login
    if (!session) {
        redirect('/admin/login');
    }

    // Check if user has admin role
    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
        redirect('/admin/login');
    }

    return (
        <AdminLayoutClient user={{ email: session.email, role: session.role }}>
            {children}
        </AdminLayoutClient>
    );
}
