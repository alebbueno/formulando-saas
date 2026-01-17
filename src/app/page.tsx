import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { PartnersSection } from "@/components/landing/partners-section"
import { StatsSection } from "@/components/landing/stats-section"
import { PlatformFeaturesSection } from "@/components/landing/platform-features-section"
import { AutomationsSection } from "@/components/landing/automations-section"
import { DashboardSection } from "@/components/landing/dashboard-section"
import { WhatsAppWidgetSection } from "@/components/landing/whatsapp-widget-section"
import { IntegrationsShowcaseSection } from "@/components/landing/integrations-showcase-section"
import { Footer } from "@/components/landing/footer"
import Script from "next/script"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Formulando - Plataforma Completa de Captação e Conversão para Agências",
  description: "Crie formulários inteligentes, landing pages de alta conversão, gerencie leads com CRM integrado, automatize processos e conecte tudo ao WhatsApp. A solução completa para agências modernas.",
  keywords: ["plataforma para agências", "formulários online", "landing pages", "CRM para agências", "automação de marketing", "widget WhatsApp", "captação de leads", "funil de vendas", "gestão de clientes"],
  openGraph: {
    title: "Formulando - Plataforma Completa de Captação e Conversão",
    description: "A plataforma completa para agências modernas captarem e converterem mais leads.",
    type: "website",
    locale: "pt_BR",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <PartnersSection />
      <StatsSection />
      <PlatformFeaturesSection />
      <AutomationsSection />
      <DashboardSection />
      <WhatsAppWidgetSection />
      <IntegrationsShowcaseSection />
      <Footer />
      <Script
        src="https://www.formulando.app/whatsapp-widget.js"
        data-workspace="2e66e7cd-a7a3-4a32-801a-7fdf1088a474"
        strategy="afterInteractive"
      />
    </main>
  )
}
