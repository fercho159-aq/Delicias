import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  PiggyBank,
  MessageCircle,
  Gift,
  ChevronRight,
  Star,
  ShoppingCart,
  Package,
} from "lucide-react";

import { getLatestProducts, getCategories } from "@/lib/products";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import { getConfigs } from "@/lib/config";
import prisma from "@/lib/prisma";
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
  const [products, categories, productCount, siteConfig] = await Promise.all([
    getLatestProducts(8).catch((err) => {
      console.error('Failed to fetch products:', err);
      return [];
    }),
    getCategories().catch((err) => {
      console.error('Failed to fetch categories:', err);
      return [];
    }),
    prisma.product.count({ where: { status: 'ACTIVE' } }).catch((err) => {
      console.error('Failed to count products:', err);
      return 0;
    }),
    getConfigs(['whatsapp_number']).catch((err) => {
      console.error('Failed to fetch site config:', err);
      return { whatsapp_number: '5215519915154' } as Record<string, string>;
    }),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <Image
            src="/hero-valentines.png"
            alt="San Valentín - Delicias del Campo"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Gift size={16} />
            <span>Del Campo a tu Mesa</span>
          </div>
          <h1 className="hero-title">
            Nueces, Semillas y<br />
            <span className="gradient-text">Frutos Secos Premium</span>
          </h1>
          <p className="hero-subtitle">
            Descubre nuestra selección de productos naturales de la más alta
            calidad. Directo del campo mexicano a tu hogar.
          </p>
          <div className="hero-buttons">
            <Link href="/productos" className="btn btn-primary btn-lg">
              <ShoppingCart size={20} />
              Comprar ahora
            </Link>
            <Link href="/nosotros" className="btn btn-outline btn-lg">
              Conoce más
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{productCount}+</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Clientes felices</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <Star size={18} />
              <span className="stat-number">4.9</span>
              <span className="stat-label">Calificación</span>
            </div>
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
