import { FAQSection } from "@/components/landing/faq-section"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CTASection } from "@/components/landing/cta-section"

export const metadata = {
  title: "FAQ - Perguntas Frequentes | Formulando",
  description: "Tire todas suas dúvidas sobre a plataforma Formulando. Saiba como funciona o CRM, automações, integrações, widget WhatsApp e muito mais.",
  keywords: ["faq formulando", "dúvidas formulando", "ajuda formulando", "como funciona formulando"],
}

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <FAQSection />
        <CTASection />
      </div>
      <Footer />
    </main>
  )
}

