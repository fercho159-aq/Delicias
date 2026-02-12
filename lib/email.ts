import nodemailer from 'nodemailer';

const FROM_NAME = 'Las Delicias del Campo';
const FROM_EMAIL = process.env.SMTP_USER || 'venta@lasdeliciasdelcampo.com';

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true, // SSL/TLS on port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

interface OrderEmailData {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
    };
    notes?: string;
}

function getPaymentMethodLabel(method: string): string {
    switch (method) {
        case 'mercadopago': return 'Mercado Pago';
        case 'whatsapp': return 'WhatsApp';
        case 'transfer': return 'Transferencia Bancaria';
        default: return method;
    }
}

function buildItemsHtml(items: OrderEmailData['items']): string {
    return items.map(item => `
        <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0ede8; font-size: 14px; color: #3d3a36;">
                ${item.name}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0ede8; font-size: 14px; color: #5c5347; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0ede8; font-size: 14px; color: #3d3a36; text-align: right;">
                $${item.total.toLocaleString('es-MX')}
            </td>
        </tr>
    `).join('');
}

function buildOrderReceivedHtml(data: OrderEmailData): string {
    const paymentNote = data.paymentMethod === 'mercadopago'
        ? 'Estamos procesando tu pago con Mercado Pago. Te notificaremos cuando se confirme.'
        : data.paymentMethod === 'whatsapp'
            ? 'Te contactaremos por WhatsApp para confirmar tu pedido y coordinar el pago.'
            : 'Te enviaremos los datos bancarios para realizar tu transferencia.';

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                    <td style="background-color: #3d6b2e; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Las Delicias del Campo</h1>
                        <p style="margin: 8px 0 0; color: #c8e6c0; font-size: 14px;">Del campo a tu mesa</p>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 32px;">
                        <h2 style="margin: 0 0 8px; color: #3d3a36; font-size: 20px;">Pedido Recibido</h2>
                        <p style="margin: 0 0 24px; color: #8b8579; font-size: 14px;">
                            Hola ${data.customerName}, hemos recibido tu pedido <strong>#${data.orderNumber}</strong>.
                        </p>

                        <!-- Payment note -->
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.5;">
                                <strong>Método de pago:</strong> ${getPaymentMethodLabel(data.paymentMethod)}<br>
                                ${paymentNote}
                            </p>
                        </div>

                        <!-- Items table -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                                <th style="padding: 8px; text-align: left; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Producto</th>
                                <th style="padding: 8px; text-align: center; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Cant.</th>
                                <th style="padding: 8px; text-align: right; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Total</th>
                            </tr>
                            ${buildItemsHtml(data.items)}
                        </table>

                        <!-- Totals -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #5c5347;">Subtotal</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #3d3a36; text-align: right;">$${data.subtotal.toLocaleString('es-MX')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #5c5347;">Envío</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #3d3a36; text-align: right;">${data.shippingCost === 0 ? 'Gratis' : '$' + data.shippingCost.toLocaleString('es-MX')}</td>
                            </tr>
                            ${data.discount > 0 ? `
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #16a34a;">Descuento</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #16a34a; text-align: right; font-weight: 600;">-$${data.discount.toLocaleString('es-MX')}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #3d3a36; border-top: 2px solid #f0ede8;">Total</td>
                                <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #3d6b2e; text-align: right; border-top: 2px solid #f0ede8;">$${data.total.toLocaleString('es-MX')} MXN</td>
                            </tr>
                        </table>

                        <!-- Shipping address -->
                        <div style="background-color: #faf9f7; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                            <h3 style="margin: 0 0 8px; font-size: 13px; color: #8b8579; text-transform: uppercase;">Dirección de envío</h3>
                            <p style="margin: 0; font-size: 14px; color: #3d3a36; line-height: 1.6;">
                                ${data.shippingAddress.street}<br>
                                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
                            </p>
                        </div>

                        ${data.notes ? `
                        <div style="background-color: #faf9f7; border-radius: 8px; padding: 16px;">
                            <h3 style="margin: 0 0 8px; font-size: 13px; color: #8b8579; text-transform: uppercase;">Notas</h3>
                            <p style="margin: 0; font-size: 14px; color: #3d3a36;">${data.notes}</p>
                        </div>
                        ` : ''}
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #faf9f7; padding: 24px 32px; text-align: center; border-top: 1px solid #f0ede8;">
                        <p style="margin: 0; font-size: 13px; color: #8b8579;">
                            ¿Preguntas? Contáctanos por WhatsApp o a venta@lasdeliciasdelcampo.com
                        </p>
                        <p style="margin: 8px 0 0; font-size: 12px; color: #b5b0a8;">
                            Las Delicias del Campo - Del campo a tu mesa
                        </p>
                    </td>
                </tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
}

function buildPaymentConfirmedHtml(data: OrderEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                    <td style="background-color: #3d6b2e; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Las Delicias del Campo</h1>
                        <p style="margin: 8px 0 0; color: #c8e6c0; font-size: 14px;">Del campo a tu mesa</p>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 32px;">
                        <!-- Success badge -->
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div style="display: inline-block; background-color: #f0fdf4; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">
                                &#10003;
                            </div>
                        </div>

                        <h2 style="margin: 0 0 8px; color: #3d3a36; font-size: 20px; text-align: center;">Pago Confirmado</h2>
                        <p style="margin: 0 0 24px; color: #8b8579; font-size: 14px; text-align: center;">
                            Hola ${data.customerName}, tu pago para el pedido <strong>#${data.orderNumber}</strong> ha sido confirmado.
                        </p>

                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: 600;">
                                Estamos preparando tu pedido para envío.
                            </p>
                        </div>

                        <!-- Items table -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                                <th style="padding: 8px; text-align: left; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Producto</th>
                                <th style="padding: 8px; text-align: center; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Cant.</th>
                                <th style="padding: 8px; text-align: right; font-size: 12px; color: #8b8579; text-transform: uppercase; border-bottom: 2px solid #f0ede8;">Total</th>
                            </tr>
                            ${buildItemsHtml(data.items)}
                        </table>

                        <!-- Total -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                                <td style="padding: 12px 0; font-size: 18px; font-weight: 700; color: #3d3a36; border-top: 2px solid #f0ede8;">Total pagado</td>
                                <td style="padding: 12px 0; font-size: 18px; font-weight: 700; color: #3d6b2e; text-align: right; border-top: 2px solid #f0ede8;">$${data.total.toLocaleString('es-MX')} MXN</td>
                            </tr>
                        </table>

                        <!-- Shipping address -->
                        <div style="background-color: #faf9f7; border-radius: 8px; padding: 16px;">
                            <h3 style="margin: 0 0 8px; font-size: 13px; color: #8b8579; text-transform: uppercase;">Dirección de envío</h3>
                            <p style="margin: 0; font-size: 14px; color: #3d3a36; line-height: 1.6;">
                                ${data.shippingAddress.street}<br>
                                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
                            </p>
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #faf9f7; padding: 24px 32px; text-align: center; border-top: 1px solid #f0ede8;">
                        <p style="margin: 0; font-size: 13px; color: #8b8579;">
                            ¿Preguntas? Contáctanos por WhatsApp o a venta@lasdeliciasdelcampo.com
                        </p>
                        <p style="margin: 8px 0 0; font-size: 12px; color: #b5b0a8;">
                            Las Delicias del Campo - Del campo a tu mesa
                        </p>
                    </td>
                </tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
}

function buildAdminNotificationHtml(data: OrderEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                <tr>
                    <td style="background-color: #3d6b2e; padding: 24px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 18px;">Nuevo Pedido #${data.orderNumber}</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 24px;">
                        <h3 style="margin: 0 0 12px; color: #3d3a36; font-size: 15px;">Datos del cliente</h3>
                        <table width="100%" style="margin-bottom: 20px; font-size: 14px;">
                            <tr><td style="padding: 4px 0; color: #8b8579;">Nombre:</td><td style="padding: 4px 0; color: #3d3a36;">${data.customerName}</td></tr>
                            <tr><td style="padding: 4px 0; color: #8b8579;">Email:</td><td style="padding: 4px 0; color: #3d3a36;">${data.customerEmail}</td></tr>
                            <tr><td style="padding: 4px 0; color: #8b8579;">Teléfono:</td><td style="padding: 4px 0; color: #3d3a36;">${data.customerPhone}</td></tr>
                            <tr><td style="padding: 4px 0; color: #8b8579;">Método de pago:</td><td style="padding: 4px 0; color: #3d3a36;">${getPaymentMethodLabel(data.paymentMethod)}</td></tr>
                        </table>

                        <h3 style="margin: 0 0 12px; color: #3d3a36; font-size: 15px;">Productos</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                            <tr>
                                <th style="padding: 6px; text-align: left; font-size: 12px; color: #8b8579; border-bottom: 1px solid #f0ede8;">Producto</th>
                                <th style="padding: 6px; text-align: center; font-size: 12px; color: #8b8579; border-bottom: 1px solid #f0ede8;">Cant.</th>
                                <th style="padding: 6px; text-align: right; font-size: 12px; color: #8b8579; border-bottom: 1px solid #f0ede8;">Total</th>
                            </tr>
                            ${buildItemsHtml(data.items)}
                        </table>

                        <p style="font-size: 16px; font-weight: 700; color: #3d6b2e; margin: 0;">
                            Total: $${data.total.toLocaleString('es-MX')} MXN
                        </p>

                        <div style="margin-top: 16px; background: #faf9f7; border-radius: 8px; padding: 12px; font-size: 13px; color: #5c5347;">
                            <strong>Envío a:</strong> ${data.shippingAddress.street}, ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
                        </div>

                        ${data.notes ? `<p style="margin: 12px 0 0; font-size: 13px; color: #5c5347;"><strong>Notas:</strong> ${data.notes}</p>` : ''}
                    </td>
                </tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
}

/**
 * Send order confirmation email to the customer.
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: data.customerEmail,
        subject: `Pedido #${data.orderNumber} recibido - Las Delicias del Campo`,
        html: buildOrderReceivedHtml(data),
    });
}

/**
 * Send payment confirmed email to the customer.
 */
export async function sendPaymentConfirmedEmail(data: OrderEmailData): Promise<void> {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: data.customerEmail,
        subject: `Pago confirmado - Pedido #${data.orderNumber} - Las Delicias del Campo`,
        html: buildPaymentConfirmedHtml(data),
    });
}

/**
 * Send new order notification email to the admin.
 */
export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: FROM_EMAIL,
        subject: `Nuevo pedido #${data.orderNumber} - $${data.total.toLocaleString('es-MX')}`,
        html: buildAdminNotificationHtml(data),
    });
}

/**
 * Build OrderEmailData from an order record with its relations.
 */
export function buildOrderEmailData(order: {
    orderNumber: string;
    paymentMethod: string | null;
    subtotal: unknown;
    shippingCost: unknown;
    discount: unknown;
    total: unknown;
    notes: string | null;
    user: { email: string; firstName: string | null; lastName: string | null; phone: string | null } | null;
    items: { name: string; quantity: number; price: unknown; total: unknown }[];
    shippingAddress: { street: string; city: string; state: string; postalCode: string } | null;
}): OrderEmailData {
    return {
        orderNumber: order.orderNumber,
        customerEmail: order.user?.email || '',
        customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
        customerPhone: order.user?.phone || '',
        paymentMethod: order.paymentMethod || 'whatsapp',
        items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        shippingAddress: order.shippingAddress
            ? {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                postalCode: order.shippingAddress.postalCode,
            }
            : { street: '', city: '', state: '', postalCode: '' },
        notes: order.notes || undefined,
    };
}
