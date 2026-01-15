import Image from 'next/image';
import { Truck, Award, Heart, Leaf } from 'lucide-react';
import './nosotros.css';

export const metadata = {
    title: 'Nosotros | Las Delicias del Campo',
    description: 'Conoce la historia detrás de Las Delicias del Campo, nuestra misión y compromiso con la calidad.',
};

export default function NosotrosPage() {
    return (
        <div className="nosotros-page">
            {/* Hero Section */}
            <div className="hero-nosotros">
                <div className="hero-bg">
                    <Image
                        src="/hero-campo.png"
                        alt="Campo de cultivo"
                        fill
                        priority
                    />
                </div>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Nuestra Historia</h1>
                    <p className="lead">Llevando lo mejor del campo a tu mesa desde hace más de 10 años.</p>
                </div>
            </div>

            <div className="container">
                {/* Story Section */}
                <section className="story-section">
                    <div className="story-content">
                        <div className="story-text">
                            <h2>¿Quiénes Somos?</h2>
                            <p>
                                <strong>Las Delicias del Campo</strong> nació con una misión simple pero poderosa: acercar los productos más frescos y nutritivos de la tierra a los hogares mexicanos.
                            </p>
                            <p>
                                Somos una empresa familiar apasionada por la calidad. Trabajamos directamente con productores locales para seleccionar las mejores nueces, semillas y frutos secos, garantizando no solo un sabor excepcional, sino también el apoyo al campo mexicano.
                            </p>
                            <p>
                                Creemos que una vida saludable comienza con una buena alimentación, y por eso nos esforzamos cada día en ofrecer productos 100% naturales, libres de conservadores y llenos de los nutrientes que tu cuerpo necesita.
                            </p>
                        </div>
                        <div className="story-image">
                            <Image
                                src="/nueces-seleccion.png"
                                alt="Selección de nueces"
                                fill
                            />
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="values-section">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2>Nuestros Pilares</h2>
                            <p className="text-neutral-600 max-w-2xl mx-auto">
                                Estos son los valores que guían cada paso que damos en Las Delicias del Campo.
                            </p>
                        </div>

                        <div className="values-grid">
                            <div className="value-card">
                                <div className="value-icon">
                                    <Leaf size={32} />
                                </div>
                                <h3>100% Natural</h3>
                                <p>
                                    Nuestros productos son seleccionados cuidadosamente para mantener su pureza y sabor original, sin aditivos innecesarios.
                                </p>
                            </div>

                            <div className="value-card">
                                <div className="value-icon">
                                    <Award size={32} />
                                </div>
                                <h3>Calidad Premium</h3>
                                <p>
                                    Solo lo mejor llega a tu mesa. Supervisamos cada lote para asegurar frescura, textura y el mejor sabor.
                                </p>
                            </div>

                            <div className="value-card">
                                <div className="value-icon">
                                    <Heart size={32} />
                                </div>
                                <h3>Pasión por el Servicio</h3>
                                <p>
                                    Nos encanta atenderte. Tu satisfacción es nuestra prioridad y estamos siempre listos para ayudarte.
                                </p>
                            </div>

                            <div className="value-card">
                                <div className="value-icon">
                                    <Truck size={32} />
                                </div>
                                <h3>Envíos a Todo México</h3>
                                <p>
                                    Estés donde estés, llevamos nuestras delicias hasta la puerta de tu hogar de forma segura y rápida.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
