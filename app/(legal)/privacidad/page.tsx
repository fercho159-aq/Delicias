import '../legal.css';

export const metadata = {
    title: 'Política de Privacidad - Las Delicias del Campo',
    description: 'Conoce cómo recopilamos, usamos y protegemos tu información personal en Las Delicias del Campo.',
};

export default function PrivacidadPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <h1>Política de Privacidad</h1>
                <p className="legal-updated">Última actualización: marzo 2026</p>

                <p className="legal-intro">
                    En <em>Las Delicias del Campo</em>, nos importa tu privacidad y nos comprometemos a proteger tu información personal. A continuación, te explicamos cómo recopilamos, usamos y protegemos tus datos.
                </p>

                <h2>1. ¿Qué Información Recopilamos?</h2>
                <p>Recopilamos información que nos proporcionas al realizar compras en línea, como:</p>
                <ul>
                    <li>Tu nombre, correo electrónico, dirección de envío y teléfono.</li>
                    <li>Información de pago (tarjetas, etc.).</li>
                    <li>Datos de navegación en nuestro sitio web (como tu dirección IP).</li>
                </ul>

                <h2>2. ¿Cómo Usamos Tu Información?</h2>
                <p>Utilizamos tu información para:</p>
                <ul>
                    <li>Procesar y enviar tus pedidos.</li>
                    <li>Mejorar tu experiencia de compra.</li>
                    <li>Enviarte promociones o novedades si te has suscrito.</li>
                </ul>

                <h2>3. ¿Cómo Protegemos Tu Información?</h2>
                <p>
                    Tomamos medidas de seguridad, como el cifrado, para proteger tus datos. Sin embargo, no podemos garantizar una seguridad del 100% debido a los riesgos en Internet.
                </p>

                <h2>4. ¿Compartimos Tu Información?</h2>
                <p>No vendemos ni compartimos tu información con terceros, salvo que sea necesario para:</p>
                <ul>
                    <li>El procesamiento de pagos o el envío de productos.</li>
                    <li>Cumplir con la ley o resolver disputas legales.</li>
                </ul>

                <h2>5. Cookies</h2>
                <p>
                    Utilizamos cookies para mejorar tu experiencia en el sitio. Puedes controlar las cookies a través de la configuración de tu navegador.
                </p>

                <h2>6. Tus Derechos</h2>
                <p>
                    Tienes derecho a acceder, corregir o eliminar tu información personal. Si deseas hacerlo o dejar de recibir correos de marketing, contáctanos.
                </p>

                <h2>7. Cambios a esta Política</h2>
                <p>
                    Podemos actualizar esta política. Te recomendamos que la revises periódicamente.
                </p>

                <div className="contact-box">
                    <h3>8. Contacto</h3>
                    <p>Si tienes preguntas o dudas sobre nuestra política de privacidad, contáctanos a:</p>
                    <ul>
                        <li>Correo electrónico: <a href="mailto:contacto@lasdeliciasdelcampo.com">contacto@lasdeliciasdelcampo.com</a></li>
                        <li>Teléfono: 56 4871 4635</li>
                        <li>Dirección: Central de Abastos de Iztapalapa, bodega C-57, entre el pasillo 2 y 3.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
