import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: "Las Delicias del Campo | Nueces, Semillas y Frutos Secos Premium",
  description: "Del campo a tu mesa. Descubre nuestra selección premium de frutos secos, semillas, nueces y botanas saludables. Envíos a todo México, compra segura y atención 24/7.",
  keywords: "frutos secos, nueces, semillas, botanas saludables, snacks naturales, México, CDMX",
  openGraph: {
    title: "Las Delicias del Campo - Botanas Saludables Premium",
    description: "Empresa familiar dedicada a la comercialización de nueces, semillas y frutos secos de la más alta calidad.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
        suppressHydrationWarning
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
