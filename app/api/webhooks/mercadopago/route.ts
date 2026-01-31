import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { payment as mpPayment } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Only process payment notifications
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
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        // Always return 200 to prevent MP from retrying endlessly
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
