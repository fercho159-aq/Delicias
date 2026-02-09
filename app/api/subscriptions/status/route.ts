import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const email = request.nextUrl.searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ subscription: null });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                status: { in: ['AUTHORIZED', 'PENDING'] },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!subscription) {
            return NextResponse.json({ subscription: null });
        }

        return NextResponse.json({
            subscription: {
                plan: subscription.plan,
                billingCycle: subscription.billingCycle,
                status: subscription.status,
                price: Number(subscription.price),
                startDate: subscription.startDate,
            },
        });

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return NextResponse.json(
            { error: 'Error al consultar la suscripción' },
            { status: 500 }
        );
    }
}
