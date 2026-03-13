import '../legal.css';

export const metadata = {
    title: 'Política de Devoluciones - Las Delicias del Campo',
    description: 'Conoce nuestra política de devoluciones y cancelaciones de pedidos en Las Delicias del Campo.',
};

export default function DevolucionesPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <h1>Política de Devoluciones</h1>
                <p className="legal-updated">Última actualización: marzo 2026</p>

                <p className="legal-intro">
                    En <em>Las Delicias del Campo</em>, nos esforzamos por ofrecer productos de alta calidad. Debido a la naturaleza de nuestros productos (alimentos y botanas), no aceptamos devoluciones, excepto en los casos descritos a continuación.
                </p>

                <h2>1. Devoluciones por Productos Dañados o Incorrectos</h2>
                <p>
                    Si recibes un producto que está dañado, defectuoso o incorrecto, por favor contáctanos dentro de las 24 horas posteriores a la recepción del pedido. En este caso, te ofreceremos una solución, que puede ser el reenvío del producto correcto o el reembolso, según lo que se acuerde.
                </p>

                <h2>2. No Aceptamos Devoluciones de Productos Abiertos o Consumidos</h2>
                <p>
                    Por razones de seguridad alimentaria y salud, no aceptamos devoluciones de productos que hayan sido abiertos o consumidos.
                </p>

                <h2>3. Cancelaciones de Pedidos</h2>
                <p>
                    Si deseas cancelar un pedido, por favor hazlo antes de que sea procesado y enviado. Una vez enviado, no podremos aceptar cancelaciones.
                </p>

                <h2>4. Procedimiento para Devoluciones</h2>
                <p>Si tu producto califica para una devolución, por favor ponte en contacto con nosotros a través de:</p>
                <ul>
                    <li>Correo electrónico: <a href="mailto:contacto@lasdeliciasdelcampo.com">contacto@lasdeliciasdelcampo.com</a></li>
                    <li>Teléfono: 56 4871 4635</li>
                </ul>
                <p>Nos encargaremos de coordinar el proceso de devolución o reemplazo.</p>

                <h2>5. Modificaciones a la Política de Devoluciones</h2>
                <p>
                    Nos reservamos el derecho de modificar esta política en cualquier momento. Las modificaciones entrarán en vigencia tan pronto como se publiquen en nuestro sitio web.
                </p>
            </div>
        </div>
    );
}
