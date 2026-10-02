import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedBackground from "@/components/AnimatedBackground";

// Fonte "Outfit" traz um ar muito moderno, jovem e geométrico
const mainFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Artur Dias | Fotografia",
  description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
  keywords: ["Fotografia", "Fotógrafo em Brasília", "Eventos", "Arquitetura", "Ensaios", "Música", "Shows"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Artur Dias Fotografia",
    title: "Artur Dias | Fotografia",
    description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
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
    <div className={`${mainFont.className} antialiased min-h-screen flex flex-col text-black relative`}>
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
