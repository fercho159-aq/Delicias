import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  PiggyBank,
  MessageCircle,
  Gift,
  ChevronRight,
  ShoppingCart,
  Package,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";

import { getLatestProducts, getCategories } from "@/lib/products";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import { getConfigs } from "@/lib/config";
import "./page.css";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'cajas-de-regalo': <Gift size={18} strokeWidth={1.5} />,
  'canasta': <Gift size={18} strokeWidth={1.5} />,
  'paquetes': <Package size={18} strokeWidth={1.5} />,
};

// Benefits data
const benefits = [
  {
    icon: <Truck size={28} strokeWidth={1.5} />,
    title: "Envíos a domicilio",
    description: "Entregamos en todo México con empaque especial para preservar la frescura de tus productos.",
  },
  {
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    title: "Compra segura",
    description: "Todos los pagos están protegidos. Tu información está segura con nosotros.",
  },
  {
    icon: <PiggyBank size={28} strokeWidth={1.5} />,
    title: "Descuentos especiales",
    description: "Promociones exclusivas y descuentos por mayoreo. ¡Más compras, mejores precios!",
  },
  {
    icon: <MessageCircle size={28} strokeWidth={1.5} />,
    title: "Atención 24/7",
    description: "Estamos disponibles para ayudarte cuando lo necesites vía WhatsApp.",
  },
];

// CMS-editable content
const cmsContent = {
  aboutTitle: "¿Quiénes Somos?",
  aboutText: `Empresa familiar dedicada a la comercialización de nueces, semillas y frutos secos seleccionados, 
    a través del más alto estándar de calidad e innovación, siempre buscando excelencia y los mejores precios.
    
    <strong>Del campo a tu mesa</strong>, logrando ser la mejor opción para nuestros clientes. Somos una empresa 
    apasionada por ofrecer los sabores más auténticos y deliciosos de la naturaleza.`,
  highlights: [
    "Más de 10 años de experiencia",
    "Productos 100% mexicanos",
    "Envíos a toda la República",
    "Precios de mayoreo disponibles",
  ],
};

export default async function Home() {
  // Fetch real data from database with error handling
  const [products, categories, siteConfig] = await Promise.all([
    getLatestProducts(8).catch((err) => {
      console.error('Failed to fetch products:', err);
      return [];
    }),
    getCategories().catch((err) => {
      console.error('Failed to fetch categories:', err);
      return [];
    }),
    getConfigs(['whatsapp_number']).catch((err) => {
      console.error('Failed to fetch site config:', err);
      return { whatsapp_number: '5215648714631' } as Record<string, string>;
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Las Delicias del Campo",
    "description": "Tienda en línea de nueces, semillas, frutos secos y cajas de regalo. Envíos a todo México.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://lasdeliciasdelcampo.com",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://lasdeliciasdelcampo.com"}/logo.png`,
    "telephone": `+52${siteConfig.whatsapp_number || '5648714631'}`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MX",
    },
    "priceRange": "$$",
    "sameAs": [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <Image
            src="/hero-temporada.jpg"
            alt="La temporada más fresca comienza aquí - Las Delicias del Campo"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
        <Link href="/productos" className="hero-link" aria-label="Ver productos" />
      </section>

      {/* Featured Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Catálogo</span>
              <h2>Nuestros Productos</h2>
              <p>Descubre nuestra variedad de productos premium</p>
            </div>
            <Link href="/productos" className="btn btn-outline">
              Ver todos
              <ChevronRight size={18} />
            </Link>
          </div>

          {products.length > 0 ? (
            <ProductGrid>
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <div className="no-products">
              <Package size={48} />
              <p>Pronto tendremos productos disponibles</p>
            </div>
          )}

          <div className="products-cta">
            <Link href="/productos" className="btn btn-primary btn-lg">
              <ShoppingCart size={20} />
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Carousel */}
      <CategoriesCarousel categories={categories} />

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegirnos?</h2>
            <p>Más que productos, ofrecemos una experiencia de calidad</p>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-badge">Nuestra Historia</span>
              <h2>{cmsContent.aboutTitle}</h2>
              <div
                className="about-text"
                dangerouslySetInnerHTML={{ __html: cmsContent.aboutText }}
              />
              <ul className="about-highlights">
                {cmsContent.highlights.map((item, index) => (
                  <li key={index}>
                    <span className="highlight-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/nosotros" className="btn btn-secondary">
                Conoce nuestra historia
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="about-image-wrapper">
              <Image
                src="/hero-nuts.png"
                alt="Nuestra historia"
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="about-badge">
                <span className="badge-number">10+</span>
                <span className="badge-text">Años de experiencia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Encuéntranos</span>
            <h2>Nuestra Ubicación</h2>
            <p>Visítanos o realiza tu pedido en línea con envío a toda la República</p>
          </div>
          <div className="location-grid">
            <div className="location-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.8!2d-99.0914!3d19.3712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce0026db097507%3A0x54061076265ee841!2sCentral%20de%20Abasto%20de%20la%20Ciudad%20de%20M%C3%A9xico!5e0!3m2!1ses-419!2smx!4v1710000000000!5m2!1ses-419!2smx"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Las Delicias del Campo"
              />
            </div>
            <div className="location-info">
              <div className="location-detail">
                <MapPin size={22} strokeWidth={1.5} />
                <div>
                  <strong>Dirección</strong>
                  <p>Central de Abastos de Iztapalapa, bodega C-57, entre pasillo 2 y 3, CDMX</p>
                </div>
              </div>
              <div className="location-detail">
                <Phone size={22} strokeWidth={1.5} />
                <div>
                  <strong>Teléfono</strong>
                  <p>56 4871 4631</p>
                </div>
              </div>
              <div className="location-detail">
                <Clock size={22} strokeWidth={1.5} />
                <div>
                  <strong>Horario</strong>
                  <p>Lun - Vie: 9:00 - 18:00</p>
                  <p>Sáb: 10:00 - 14:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para probar lo mejor del campo?</h2>
            <p>
              Únete a miles de clientes satisfechos que ya disfrutan de
              nuestros productos naturales
            </p>
            <div className="cta-buttons">
              <Link href="/productos" className="btn btn-primary btn-lg">
                <ShoppingCart size={20} />
                Explorar productos
              </Link>
              <Link
                href={`https://wa.me/${siteConfig.whatsapp_number}`}
                target="_blank"
                className="btn btn-outline btn-lg"
              >
                <MessageCircle size={20} />
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
