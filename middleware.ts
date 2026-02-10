import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ limit: 20, windowMs: 60 * 1000 });

export function middleware(request: NextRequest) {
    // Skip rate limiting for webhook routes
    if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
        return NextResponse.next();
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const { success, remaining } = limiter.check(ip);

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '20',
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': '60',
                },
            }
        );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '20');
    response.headers.set('X-RateLimit-Remaining', String(remaining));

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
