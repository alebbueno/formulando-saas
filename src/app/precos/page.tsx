import { PricingSection } from "@/components/landing/pricing-section"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CTASection } from "@/components/landing/cta-section"

export const metadata = {
  title: "Preços e Planos - Formulando | 7 dias grátis",
  description: "Planos para agências de todos os tamanhos. Growth (R$ 249), Scale (R$ 549) e Agency Pro (R$ 899). Teste grátis por 7 dias, sem cartão de crédito.",
  keywords: ["preços formulando", "planos formulando", "planos agência", "software para agência", "teste grátis"],
}

export default function PrecosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <PricingSection />
        <CTASection />
      </div>
      <Footer />
    </main>
  )
}

