import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { payment as mpPayment, getMPSubscription } from '@/lib/mercadopago';
import { sendPaymentConfirmedEmail, buildOrderEmailData } from '@/lib/email';

/**
 * Verify the Mercado Pago webhook signature using HMAC-SHA256.
 * MP sends `x-signature` header in the format: ts=TIMESTAMP,v1=HASH
 * The signed payload is: "id:REQUEST_ID;ts:TIMESTAMP;"
 * where REQUEST_ID comes from the `x-request-id` header
 * and the dataId is the `data.id` from the notification body (passed via query param).
 */
async function verifyMPSignature(
    request: NextRequest,
    dataId: string,
): Promise<boolean> {
    const secret = process.env.MP_WEBHOOK_SECRET;

    // If no secret is configured, skip verification (development mode)
    if (!secret) {
        console.warn('Webhook: MP_WEBHOOK_SECRET not set, skipping signature verification');
        return true;
    }

    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
        console.error('Webhook: Missing x-signature or x-request-id headers');
        return false;
    }

    // Parse "ts=TIMESTAMP,v1=HASH" from x-signature header
    const parts: Record<string, string> = {};
    for (const part of xSignature.split(',')) {
        const [key, ...valueParts] = part.trim().split('=');
        parts[key] = valueParts.join('=');
    }

    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) {
        console.error('Webhook: Invalid x-signature format');
        return false;
    }

    // Build the manifest string as specified by MP documentation
    // The template is: id:[data.id];request-id:[x-request-id];ts:[ts];
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Compute HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(manifest),
    );

    // Convert to hex string
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // Constant-time comparison
    if (computedHash.length !== v1.length) {
        return false;
    }

    let mismatch = 0;
    for (let i = 0; i < computedHash.length; i++) {
        mismatch |= computedHash.charCodeAt(i) ^ v1.charCodeAt(i);
    }

    return mismatch === 0;
}

/**
 * Deduct inventory for each item in the order.
 * Decrements ProductVariant.stock and updates inStock flag within a transaction.
 */
async function deductInventory(orderNumber: string): Promise<void> {
    const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
            items: {
                include: {
                    variant: true,
                },
            },
        },
    });

    if (!order || order.items.length === 0) {
        console.warn(`Webhook: No order items found for inventory deduction (${orderNumber})`);
        return;
    }

    await prisma.$transaction(
        order.items.map((item) =>
            prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                    // Mark as out of stock if the remaining stock will be <= 0
                    // We check current stock vs quantity being deducted
                    inStock: item.variant.stock - item.quantity > 0,
                },
            }),
        ),
    );

    console.log(`Webhook: Inventory deducted for order ${orderNumber} (${order.items.length} items)`);
}

export async function POST(request: NextRequest) {
    try {
        // Clone the request so we can read the body and still access headers
        const body = await request.json();

        // Extract data.id for signature verification
        const dataId = body.data?.id ? String(body.data.id) : '';

        // Verify webhook signature
        const isValid = await verifyMPSignature(request, dataId);
        if (!isValid) {
            console.error('Webhook: Signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Handle subscription preapproval notifications
        if (body.type === 'subscription_preapproval') {
            const preapprovalId = body.data?.id;

            if (!preapprovalId) {
                return NextResponse.json({ received: true }, { status: 200 });
            }

            const mpSub = await getMPSubscription(preapprovalId);

            // Map MP status to our enum
            let status: 'PENDING' | 'AUTHORIZED' | 'PAUSED' | 'CANCELLED' = 'PENDING';
            switch (mpSub.status) {
                case 'authorized':
                    status = 'AUTHORIZED';
                    break;
                case 'paused':
                    status = 'PAUSED';
                    break;
                case 'cancelled':
                    status = 'CANCELLED';
                    break;
                case 'pending':
                default:
                    status = 'PENDING';
                    break;
            }

            // Find subscription by mpSubscriptionId, fallback by external_reference
            let subscription = await prisma.subscription.findUnique({
                where: { mpSubscriptionId: String(preapprovalId) },
            });

            if (!subscription && mpSub.external_reference) {
                subscription = await prisma.subscription.findFirst({
                    where: { id: parseInt(mpSub.external_reference) },
                });
            }

            if (subscription) {
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status,
                        mpSubscriptionId: String(preapprovalId),
                        startDate: mpSub.date_created ? new Date(mpSub.date_created) : undefined,
                        nextPaymentDate: mpSub.next_payment_date ? new Date(mpSub.next_payment_date) : undefined,
                    },
                });
                console.log(`Webhook: Subscription ${subscription.id} updated to ${status}`);
            } else {
                console.warn('Webhook: no matching subscription for preapproval', preapprovalId);
            }
        }

        // Handle payment notifications
        if (body.type === 'payment') {
            const paymentId = body.data?.id;

            if (!paymentId) {
                return NextResponse.json({ received: true }, { status: 200 });
            }

            // Fetch full payment details from MP API
            const paymentData = await mpPayment.get({ id: paymentId });

            const externalReference = paymentData.external_reference;
            const mpStatus = paymentData.status;

            if (!externalReference) {
                console.warn('Webhook: no external_reference in payment', paymentId);
                return NextResponse.json({ received: true }, { status: 200 });
            }

            // Map MP status to our enums
            let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' = 'PENDING';
            let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' = 'PENDING';

            switch (mpStatus) {
                case 'approved':
                    paymentStatus = 'PAID';
                    orderStatus = 'CONFIRMED';
                    break;
                case 'rejected':
                case 'cancelled':
                    paymentStatus = 'FAILED';
                    orderStatus = 'CANCELLED';
                    break;
                case 'refunded':
                    paymentStatus = 'REFUNDED';
                    orderStatus = 'REFUNDED';
                    break;
                case 'in_process':
                case 'pending':
                case 'authorized':
                    paymentStatus = 'PENDING';
                    orderStatus = 'PENDING';
                    break;
            }

            // Update order in database
            await prisma.order.update({
                where: { orderNumber: externalReference },
                data: {
                    paymentStatus,
                    status: orderStatus,
                    mpPaymentId: String(paymentId),
                }
            });

            console.log(`Webhook: Order ${externalReference} updated to ${paymentStatus}`);

            // Deduct inventory when payment is approved
            if (orderStatus === 'CONFIRMED') {
                try {
                    await deductInventory(externalReference);
                } catch (inventoryError) {
                    console.error(`Webhook: Failed to deduct inventory for order ${externalReference}:`, inventoryError);
                }

                // Send payment confirmed email
                try {
                    const fullOrder = await prisma.order.findUnique({
                        where: { orderNumber: externalReference },
                        include: {
                            user: true,
                            items: true,
                            shippingAddress: true,
                        },
                    });
                    if (fullOrder && fullOrder.user) {
                        const emailData = buildOrderEmailData(fullOrder);
                        sendPaymentConfirmedEmail(emailData).catch(err =>
                            console.error(`Webhook: Failed to send payment email for ${externalReference}:`, err)
                        );
                    }
                } catch (emailError) {
                    console.error(`Webhook: Failed to send payment email for ${externalReference}:`, emailError);
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        // Always return 200 to prevent MP from retrying endlessly
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
