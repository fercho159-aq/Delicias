import { NextRequest, NextResponse } from 'next/server';
import { getConfigs } from '@/lib/config';

const PUBLIC_KEYS = ['whatsapp_number', 'shipping_cost', 'free_shipping_threshold', 'store_name'];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keys = searchParams.get('keys')?.split(',').filter(k => PUBLIC_KEYS.includes(k)) || PUBLIC_KEYS;

        const configs = await getConfigs(keys);
        return NextResponse.json(configs);
    } catch (error) {
        console.error('Error al obtener configuración pública:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
