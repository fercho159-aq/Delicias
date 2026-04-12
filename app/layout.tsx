import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/CartContext";
import { UserProvider } from "@/lib/UserContext";
import CartDrawer from "@/components/CartDrawer";
import { getConfig } from "@/lib/config";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lasdeliciasdelcampo.com';

export const metadata: Metadata = {
  title: {
    default: "Las Delicias del Campo | Nueces, Semillas y Frutos Secos Premium",
    template: "%s | Las Delicias del Campo",
  },
  description: "Tienda en línea de nueces, semillas, frutos secos, botanas y cajas de regalo. Envíos a todo México. Más de 100 productos naturales de la más alta calidad, directo del campo a tu mesa.",
  keywords: [
    "nueces", "semillas", "frutos secos", "botanas saludables", "snacks naturales",
    "cacahuates", "almendras", "pistaches", "cajas de regalo", "charolas",
    "fruta deshidratada", "gomitas", "dulces mexicanos", "tienda en línea",
    "envíos a todo México", "CDMX", "mayoreo", "Las Delicias del Campo",
  ],
  authors: [{ name: "Las Delicias del Campo" }],
  creator: "Las Delicias del Campo",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Las Delicias del Campo | Nueces, Semillas y Frutos Secos Premium",
    description: "Tienda en línea de nueces, semillas, frutos secos y cajas de regalo. Envíos a todo México con la mejor calidad y precios.",
    type: "website",
    locale: "es_MX",
    siteName: "Las Delicias del Campo",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Las Delicias del Campo - Nueces, Semillas y Frutos Secos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Las Delicias del Campo | Nueces y Frutos Secos Premium",
    description: "Tienda en línea de nueces, semillas, frutos secos y cajas de regalo. Envíos a todo México.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = await getConfig('whatsapp_number');

  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
        suppressHydrationWarning
      >
        <UserProvider>
          <CartProvider>
            <Header whatsappNumber={whatsappNumber} />
            <main>{children}</main>
            <Footer whatsappNumber={whatsappNumber} />
            <CartDrawer />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
