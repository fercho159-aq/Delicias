import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import nodemailer from 'nodemailer';

const FROM_NAME = 'Las Delicias del Campo';
const FROM_EMAIL = process.env.SMTP_USER || 'venta@lasdeliciasdelcampo.com';

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

function buildTestEmailHtml(): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <tr>
                    <td style="background-color: #3d6b2e; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Las Delicias del Campo</h1>
                        <p style="margin: 8px 0 0; color: #c8e6c0; font-size: 14px;">Del campo a tu mesa</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px;">
                        <h2 style="margin: 0 0 8px; color: #3d3a36; font-size: 20px;">Prueba de Correo</h2>
                        <p style="margin: 0 0 24px; color: #8b8579; font-size: 14px;">
                            Este es un correo de prueba enviado desde el panel de administración.
                        </p>
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: 600;">
                                La configuración SMTP está funcionando correctamente.
                            </p>
                        </div>
                        <p style="margin: 24px 0 0; color: #8b8579; font-size: 13px;">
                            Servidor: <strong>${process.env.SMTP_HOST || 'smtp.hostinger.com'}</strong><br>
                            Puerto: <strong>${process.env.SMTP_PORT || '465'}</strong><br>
                            Remitente: <strong>${FROM_EMAIL}</strong>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #faf9f7; padding: 24px 32px; text-align: center; border-top: 1px solid #f0ede8;">
                        <p style="margin: 0; font-size: 12px; color: #b5b0a8;">
                            Las Delicias del Campo - Panel de Administración
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
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const to = body.to?.trim().toLowerCase();

        if (!to) {
            return NextResponse.json({ error: 'Se requiere un correo destino' }, { status: 400 });
        }

        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject: 'Prueba de correo - Las Delicias del Campo',
            html: buildTestEmailHtml(),
        });

        return NextResponse.json({ success: true, message: 'Correo de prueba enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar correo de prueba:', error);
        return NextResponse.json(
            { error: 'Error al enviar el correo. Revisa la configuración SMTP.' },
            { status: 500 }
        );
    }
}
