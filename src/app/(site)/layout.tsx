import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTop from "@/components/ScrollToTop";

// Fonte "Outfit" traz um ar muito moderno, jovem e geométrico
const mainFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Artur Dias | Fotografia",
  description: "Portfólio de fotografia de eventos, arquitetura, música e ensaios em Brasília.",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${mainFont.className} antialiased min-h-screen flex flex-col bg-white text-black`}>
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
