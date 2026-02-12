import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString, isValidEmail } from '@/lib/validation';

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

        // Log the contact form submission (can be extended to send email or save to DB)
        console.log('=== NUEVO MENSAJE DE CONTACTO ===');
        console.log(`Nombre: ${nombre}`);
        console.log(`Email: ${email}`);
        console.log(`Teléfono: ${telefono || 'No proporcionado'}`);
        console.log(`Asunto: ${asunto}`);
        console.log(`Mensaje: ${mensaje}`);
        console.log('================================');

        return NextResponse.json({
            success: true,
            message: 'Mensaje enviado correctamente. Te responderemos pronto.'
        });
    } catch (error) {
        console.error('Error en formulario de contacto:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
