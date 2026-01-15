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
  title: "Formulando - Crie Formulários Profissionais com Facilidade",
  description: "Plataforma poderosa para criar formulários profissionais com IA, páginas de captura e pesquisas interativas com interface intuitiva de arrastar e soltar.",
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
      </body>
    </html>
  );
}
