import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createMPSubscription } from '@/lib/mercadopago';
import { SubscriptionPlan, BillingCycle } from '@prisma/client';
import { sanitizeString, isValidEmail } from '@/lib/validation';

const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; annual: number; daily?: number }> = {
    BASICO: { monthly: 499, annual: 4990 },
    PREMIUM: { monthly: 799, annual: 7990 },
    FAMILIAR: { monthly: 1199, annual: 11990 },
    TEST: { monthly: 1, annual: 1, daily: 1 },
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

        // --- Input validation ---
        const errors: string[] = [];

        // Validate plan
        const plan = body.plan?.toUpperCase() as SubscriptionPlan;
        const validPlans = Object.keys(PLAN_PRICES);
        if (!plan || !validPlans.includes(plan)) {
            errors.push(`El plan es inválido. Los planes válidos son: ${validPlans.join(', ')}.`);
        }

        // Validate billingCycle
        const validCycles = ['MONTHLY', 'ANNUAL', 'DAILY'];
        const cycleRaw = body.billingCycle?.toUpperCase();
        if (!cycleRaw || !validCycles.includes(cycleRaw)) {
            errors.push(`El ciclo de facturación es inválido. Los valores válidos son: ${validCycles.join(', ')}.`);
        }

        // Validate customer email
        if (!body.customer?.email || !isValidEmail(body.customer.email)) {
            errors.push('El correo electrónico no es válido.');
        }

        // Validate customer names
        if (!sanitizeString(body.customer?.firstName)) {
            errors.push('El nombre es requerido.');
        }
        if (!sanitizeString(body.customer?.lastName)) {
            errors.push('El apellido es requerido.');
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(' ') },
                { status: 400 }
            );
        }

        // Sanitize string inputs
        body.customer.firstName = sanitizeString(body.customer.firstName);
        body.customer.lastName = sanitizeString(body.customer.lastName);
        body.customer.email = body.customer.email.trim().toLowerCase();
        body.customer.phone = sanitizeString(body.customer.phone);

        const cycleInput = cycleRaw;
        const billingCycle = cycleInput === 'ANNUAL' ? BillingCycle.ANNUAL
            : cycleInput === 'DAILY' ? BillingCycle.DAILY
            : BillingCycle.MONTHLY;
        const price = billingCycle === BillingCycle.ANNUAL
            ? PLAN_PRICES[plan].annual
            : billingCycle === BillingCycle.DAILY
            ? (PLAN_PRICES[plan].daily ?? PLAN_PRICES[plan].monthly)
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
        let frequency = 1;
        let frequencyType = 'months';
        let transactionAmount = PLAN_PRICES[plan].monthly;
        let label = 'Mensual';

        if (billingCycle === BillingCycle.ANNUAL) {
            frequency = 12;
            frequencyType = 'months';
            transactionAmount = PLAN_PRICES[plan].annual;
            label = 'Anual';
        } else if (billingCycle === BillingCycle.DAILY) {
            frequency = 1;
            frequencyType = 'days';
            transactionAmount = PLAN_PRICES[plan].daily ?? 1;
            label = 'Diario';
        }

        const mpSubscription = await createMPSubscription({
            reason: `Membresía ${plan.charAt(0) + plan.slice(1).toLowerCase()} - ${label}`,
            external_reference: String(subscription.id),
            payer_email: body.customer.email,
            auto_recurring: {
                frequency,
                frequency_type: frequencyType,
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
