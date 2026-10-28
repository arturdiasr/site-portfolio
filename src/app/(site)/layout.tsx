import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedBackground from "@/components/AnimatedBackground";
import SmoothScroll from "@/components/SmoothScroll";

// Fonte "Outfit" traz um ar moderno, limpo e geométrico para UI e navegação
const mainFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Fonte "Cormorant Garamond" adiciona contraste editorial sofisticado para títulos e citações
const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.arturdiasfotografia.com.br"),
  title: "Artur Dias | Fotografia",
  description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
  keywords: ["Fotografia", "Fotógrafo em Brasília", "Eventos", "Arquitetura", "Ensaios", "Música", "Shows"],
  icons: {
    icon: "/artur_perfil.jpg",
    shortcut: "/artur_perfil.jpg",
    apple: "/artur_perfil.jpg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Artur Dias Fotografia",
    title: "Artur Dias | Fotografia",
    description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
    images: [
      {
        url: "/artur_perfil.jpg",
        width: 1000,
        height: 1000,
        alt: "Artur Dias Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Artur Dias | Fotografia",
    description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
    images: ["/artur_perfil.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${mainFont.variable} ${serifFont.variable} ${mainFont.className} font-sans antialiased min-h-screen flex flex-col text-black relative`}>
      <SmoothScroll />
      <AnimatedBackground />
      <Header />
      <main className="flex-grow w-full mx-auto px-6 sm:px-10 md:px-16 xl:px-24 max-w-[2560px]">
        {children}
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </div>
  );
}
