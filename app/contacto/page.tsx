import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './contacto.css';

export const metadata = {
    title: 'Contacto | Las Delicias del Campo',
    description: 'Contáctanos para pedidos, dudas o comentarios. Estamos para ayudarte.',
};

export default function ContactoPage() {
    return (
        <div className="contacto-page">
            <div className="container">
                <div className="contacto-header">
                    <h1>Contáctanos</h1>
                    <p>
                        ¿Tienes preguntas sobre nuestros productos o tu pedido?
                        Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible.
                    </p>
                </div>

                <div className="contacto-grid">
                    {/* Contact Info */}
                    <div className="contacto-info">
                        <div className="info-card">
                            <div className="info-icon">
                                <Phone size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Teléfono</h3>
                                <p>
                                    <a href="tel:+525519915154">55 1991 5154</a>
                                </p>
                                <p>Lunes a Viernes, 9:00 - 18:00</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <Mail size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Email</h3>
                                <p>
                                    <a href="mailto:contacto@lasdeliciasdelcampo.com">contacto@lasdeliciasdelcampo.com</a>
                                </p>
                                <p>Te respondemos en menos de 24 horas</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <MapPin size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Ubicación</h3>
                                <p>Ciudad de México, México</p>
                                <p>Envíos a toda la República</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <Clock size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Horario de Atención</h3>
                                <p>Lunes a Viernes: 9:00 - 18:00</p>
                                <p>Sábados: 10:00 - 14:00</p>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/5215519915154?text=Hola,%20me%20gustaría%20más%20información%20sobre%20sus%20productos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-cta"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Escríbenos por WhatsApp
                        </a>
                    </div>

                    {/* Contact Form */}
                    <div className="contacto-form-container">
                        <h2>Envíanos un mensaje</h2>
                        <form>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre</label>
                                    <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" placeholder="tu@email.com" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono (opcional)</label>
                                <input type="tel" id="telefono" name="telefono" placeholder="55 1234 5678" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="asunto">Asunto</label>
                                <select id="asunto" name="asunto" required>
                                    <option value="">Selecciona una opción</option>
                                    <option value="pedido">Información sobre un pedido</option>
                                    <option value="productos">Consulta sobre productos</option>
                                    <option value="mayoreo">Ventas de mayoreo</option>
                                    <option value="sugerencia">Sugerencia o comentario</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="mensaje">Mensaje</label>
                                <textarea
                                    id="mensaje"
                                    name="mensaje"
                                    placeholder="¿En qué podemos ayudarte?"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn">
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
