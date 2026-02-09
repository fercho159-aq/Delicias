import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createMPSubscription } from '@/lib/mercadopago';
import { SubscriptionPlan, BillingCycle } from '@prisma/client';

const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; annual: number }> = {
    BASICO: { monthly: 499, annual: 4990 },
    PREMIUM: { monthly: 799, annual: 7990 },
    FAMILIAR: { monthly: 1199, annual: 11990 },
};

interface CreateSubscriptionBody {
    plan: string;
    billingCycle: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateSubscriptionBody = await request.json();

        // Validate plan
        const plan = body.plan?.toUpperCase() as SubscriptionPlan;
        if (!PLAN_PRICES[plan]) {
            return NextResponse.json(
                { error: 'Plan inválido' },
                { status: 400 }
            );
        }

        if (!body.customer?.email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const billingCycle = body.billingCycle?.toUpperCase() === 'ANNUAL' ? BillingCycle.ANNUAL : BillingCycle.MONTHLY;
        const price = billingCycle === BillingCycle.ANNUAL
            ? PLAN_PRICES[plan].annual
            : PLAN_PRICES[plan].monthly;

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: body.customer.email }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: body.customer.email,
                    firstName: body.customer.firstName,
                    lastName: body.customer.lastName,
                    phone: body.customer.phone,
                }
            });
        }

        // Check for existing active subscription
        const existingSub = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                status: { in: ['AUTHORIZED', 'PENDING'] },
            },
        });

        if (existingSub) {
            return NextResponse.json(
                { error: 'Ya tienes una suscripción activa' },
                { status: 409 }
            );
        }

        // Create subscription record in DB
        const subscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                plan,
                billingCycle,
                status: 'PENDING',
                price,
                mpPayerEmail: body.customer.email,
            },
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Create subscription in Mercado Pago
        const frequency = billingCycle === BillingCycle.ANNUAL ? 12 : 1;
        const transactionAmount = billingCycle === BillingCycle.ANNUAL
            ? PLAN_PRICES[plan].annual
            : PLAN_PRICES[plan].monthly;

        const mpSubscription = await createMPSubscription({
            reason: `Membresía ${plan.charAt(0) + plan.slice(1).toLowerCase()} - ${billingCycle === BillingCycle.ANNUAL ? 'Anual' : 'Mensual'}`,
            external_reference: String(subscription.id),
            payer_email: body.customer.email,
            auto_recurring: {
                frequency,
                frequency_type: 'months',
                transaction_amount: transactionAmount,
                currency_id: 'MXN',
            },
            back_url: `${siteUrl}/membresias/resultado`,
            status: 'pending',
        });

        // Update subscription with MP data
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                mpSubscriptionId: mpSubscription.id,
                mpInitPoint: mpSubscription.init_point,
            },
        });

        return NextResponse.json({
            success: true,
            initPoint: mpSubscription.init_point,
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: 'Error al crear la suscripción' },
            { status: 500 }
        );
    }
}
