import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString, isValidEmail } from '@/lib/validation';
import nodemailer from 'nodemailer';

const FROM_NAME = 'Las Delicias del Campo';
const FROM_EMAIL = process.env.SMTP_USER || 'venta@lasdeliciasdelcampo.com';
const ADMIN_EMAIL = process.env.SMTP_USER || 'venta@lasdeliciasdelcampo.com';

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const asuntoLabels: Record<string, string> = {
    pedido: 'Información sobre un pedido',
    productos: 'Consulta sobre productos',
    mayoreo: 'Ventas de mayoreo',
    sugerencia: 'Sugerencia o comentario',
    otro: 'Otro',
};

function buildContactEmailHtml(nombre: string, email: string, telefono: string, asunto: string, mensaje: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <tr>
                    <td style="background-color: #3d6b2e; padding: 24px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Nuevo Mensaje de Contacto</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px;">
                        <table width="100%" style="margin-bottom: 24px; font-size: 14px;">
                            <tr>
                                <td style="padding: 8px 0; color: #8b8579; width: 120px; vertical-align: top;">Nombre:</td>
                                <td style="padding: 8px 0; color: #3d3a36; font-weight: 600;">${nombre}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #8b8579; vertical-align: top;">Email:</td>
                                <td style="padding: 8px 0; color: #3d3a36;"><a href="mailto:${email}" style="color: #3d6b2e;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #8b8579; vertical-align: top;">Teléfono:</td>
                                <td style="padding: 8px 0; color: #3d3a36;">${telefono || 'No proporcionado'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #8b8579; vertical-align: top;">Asunto:</td>
                                <td style="padding: 8px 0; color: #3d3a36;">${asuntoLabels[asunto] || asunto}</td>
                            </tr>
                        </table>

                        <div style="background-color: #faf9f7; border-radius: 8px; padding: 20px; border-left: 4px solid #3d6b2e;">
                            <h3 style="margin: 0 0 12px; font-size: 13px; color: #8b8579; text-transform: uppercase;">Mensaje</h3>
                            <p style="margin: 0; font-size: 14px; color: #3d3a36; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #faf9f7; padding: 16px 32px; text-align: center; border-top: 1px solid #f0ede8;">
                        <p style="margin: 0; font-size: 12px; color: #b5b0a8;">
                            Mensaje enviado desde el formulario de contacto de lasdeliciasdelcampo.com
                        </p>
                    </td>
                </tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const nombre = sanitizeString(body.nombre);
        const email = body.email?.trim().toLowerCase();
        const telefono = sanitizeString(body.telefono || '');
        const asunto = sanitizeString(body.asunto);
        const mensaje = sanitizeString(body.mensaje);

        if (!nombre || nombre.length < 2) {
            return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
        }
        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }
        if (!asunto) {
            return NextResponse.json({ error: 'El asunto es requerido' }, { status: 400 });
        }
        if (!mensaje || mensaje.length < 10) {
            return NextResponse.json({ error: 'El mensaje debe tener al menos 10 caracteres' }, { status: 400 });
        }

        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            replyTo: email,
            to: ADMIN_EMAIL,
            subject: `Contacto: ${asuntoLabels[asunto] || asunto} - ${nombre}`,
            html: buildContactEmailHtml(nombre, email, telefono, asunto, mensaje),
        });

        return NextResponse.json({
            success: true,
            message: 'Mensaje enviado correctamente. Te responderemos pronto.'
        });
    } catch (error) {
        console.error('Error en formulario de contacto:', error);
        return NextResponse.json({ error: 'Error al enviar el mensaje. Intenta de nuevo.' }, { status: 500 });
    }
}
