import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { DM_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Formulando - Plataforma Completa de Captação e Conversão para Agências",
  description: "Crie formulários, landing pages, gerencie leads com CRM integrado, automatize processos e conecte com WhatsApp. Tudo que sua agência precisa em um só lugar.",
  keywords: ["formulários online", "landing pages", "CRM", "automação de marketing", "captação de leads", "widget WhatsApp", "gestão de leads", "funil de vendas"],
  openGraph: {
    title: "Formulando - Plataforma Completa de Captação e Conversão",
    description: "A plataforma completa para agências modernas. Formulários, landing pages, CRM, automações e muito mais.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formulando - Plataforma Completa de Captação e Conversão",
    description: "A plataforma completa para agências modernas. Formulários, landing pages, CRM, automações e muito mais.",
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${dmSans.variable} ${beVietnamPro.variable} font-sans antialiased`}
      >
        <NextTopLoader
          color="#8831d2"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #8831d2,0 0 5px #8831d2"
        />
        {children}
        <Toaster />

        <script
          src="https://www.formulando.app/whatsapp-widget.js"
          data-workspace="2e66e7cd-a7a3-4a32-801a-7fdf1088a474"
        ></script>
      </body>
    </html>
  );
}
