import '../legal.css';

export const metadata = {
    title: 'Información de Envíos - Las Delicias del Campo',
    description: 'Conoce nuestras opciones de envío, costos, tiempos de entrega y recogida en tienda.',
};

export default function EnviosPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <h1>Información de Envíos</h1>
                <p className="legal-updated">Última actualización: marzo 2026</p>

                <p className="legal-intro">
                    En <em>Las Delicias del Campo</em>, nos aseguramos de que tu pedido llegue de manera segura y en el menor tiempo posible. A continuación, te explicamos cómo funciona nuestro proceso de envío y recogida.
                </p>

                <h2>1. Opciones de Envío</h2>
                <ul>
                    <li><strong>Envío a Domicilio:</strong> Ofrecemos la opción de envío a domicilio para todos nuestros productos. El costo de envío dependerá de tu ubicación y del tamaño o peso del pedido. El costo total se calculará al momento de la compra.</li>
                    <li><strong>Recogida en Tienda:</strong> Si prefieres no pagar por el envío, puedes optar por recoger tu pedido directamente en nuestra tienda. Solo selecciona la opción de &quot;Recoger en tienda&quot; al hacer tu compra y te avisaremos cuando tu pedido esté listo para ser retirado.</li>
                </ul>

                <h2>2. Costos de Envío</h2>
                <p>
                    El costo de envío varía según la dirección de entrega y el tipo de producto. Durante el proceso de compra, verás el costo total de envío antes de realizar el pago. No cobramos cargos adicionales por la opción de recogida en tienda.
                </p>

                <h2>3. Tiempos de Entrega</h2>
                <ul>
                    <li><strong>Envío a Domicilio:</strong> El tiempo de entrega varía dependiendo de tu ubicación, pero generalmente, los pedidos se entregan dentro de 10 días hábiles. Recibirás una notificación cuando tu pedido haya sido enviado y esté en camino.</li>
                    <li><strong>Recogida en Tienda:</strong> Si eliges la opción de recogida en tienda, recibirás una notificación por correo electrónico o mensaje cuando tu pedido esté listo para ser recogido en la tienda.</li>
                </ul>

                <h2>4. ¿Qué Hacer Si Mi Pedido No Llega a Tiempo?</h2>
                <p>Si tu pedido no llega dentro del tiempo estimado, por favor contáctanos a través de:</p>
                <ul>
                    <li>Correo electrónico: <a href="mailto:contacto@lasdeliciasdelcampo.com">contacto@lasdeliciasdelcampo.com</a></li>
                    <li>Teléfono: 56 4871 4635</li>
                </ul>
                <p>Haremos todo lo posible para resolver cualquier inconveniente relacionado con tu envío.</p>

                <h2>5. Direcciones Incorrectas</h2>
                <p>
                    Es importante que verifiques que la dirección de envío que proporcionas es correcta. Si el paquete no puede ser entregado debido a una dirección incorrecta proporcionada por el cliente, los costos adicionales derivados de la reexpedición serán a cargo del cliente.
                </p>

                <h2>6. Modificaciones a la Política de Envíos</h2>
                <p>
                    Nos reservamos el derecho de modificar esta política en cualquier momento. Las modificaciones entrarán en vigencia tan pronto como se publiquen en nuestro sitio web.
                </p>
            </div>
        </div>
    );
}
