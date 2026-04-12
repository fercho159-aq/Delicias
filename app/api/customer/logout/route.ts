import { NextResponse } from 'next/server';
import { deleteCustomerSessionCookie } from '@/lib/auth';

export async function POST() {
    await deleteCustomerSessionCookie();
    return NextResponse.json({ success: true });
}
