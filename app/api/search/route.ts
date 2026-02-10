import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/products';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawQuery = searchParams.get('q') || '';

        // Sanitize: trim whitespace and limit length
        const query = rawQuery.trim().slice(0, 100);

        // Validate minimum length
        if (query.length < 2) {
            return NextResponse.json(
                { error: 'La búsqueda debe tener al menos 2 caracteres', products: [] },
                { status: 400 }
            );
        }

        const products = await searchProducts(query);

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Error al buscar productos', products: [] },
            { status: 500 }
        );
    }
}
