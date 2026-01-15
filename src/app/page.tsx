import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { PartnersSection } from "@/components/landing/partners-section"
import { StatsSection } from "@/components/landing/stats-section"
import { PlatformFeaturesSection } from "@/components/landing/platform-features-section"
import { AutomationsSection } from "@/components/landing/automations-section"
import { DashboardSection } from "@/components/landing/dashboard-section"
import { WhatsAppWidgetSection } from "@/components/landing/whatsapp-widget-section"
import { IntegrationsShowcaseSection } from "@/components/landing/integrations-showcase-section"
import { TemplatesSection } from "@/components/landing/templates-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

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
      <TemplatesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}
