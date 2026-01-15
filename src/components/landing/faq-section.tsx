"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function FAQSection() {
  const faqs = [
    {
      question: "O Formulando é só um criador de formulários?",
      answer:
        "Não! O Formulando é uma plataforma completa de marketing digital. Além de criar formulários, você pode construir landing pages, gerenciar leads com CRM integrado, criar automações, integrar com WhatsApp e conectar com milhares de ferramentas através de integrações.",
    },
    {
      question: "Preciso de conhecimento técnico para usar?",
      answer:
        "Não! Todas as ferramentas são no-code com interface visual de arrastar e soltar. Qualquer pessoa pode criar formulários, landing pages e automações sem escrever código. Para desenvolvedores, oferecemos API REST completa e webhooks.",
    },
    {
      question: "Como funciona o sistema de leads e CRM?",
      answer:
        "Todo lead capturado através dos formulários é automaticamente adicionado ao CRM integrado. Você pode organizar leads em pipelines (Kanban), adicionar tags, fazer anotações e acompanhar todo histórico de interações em um único lugar.",
    },
    {
      question: "Posso integrar com minhas ferramentas atuais?",
      answer:
        "Sim! Oferecemos integrações nativas com as principais ferramentas, além de conectores com Zapier e Make que permitem integrar com mais de 5000 aplicativos. Também temos webhooks e API REST para integrações customizadas.",
    },
    {
      question: "Como funciona o widget do WhatsApp?",
      answer:
        "É um botão flutuante que você adiciona ao seu site. Quando o visitante clica, abre direto no WhatsApp com uma mensagem pré-configurada. Você pode personalizar mensagens diferentes para cada página e todos os leads são capturados automaticamente.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Absolutamente. Usamos criptografia SSL, estamos em conformidade com LGPD e GDPR, e seus dados são armazenados em servidores seguros. Você tem controle total sobre seus dados e pode exportá-los a qualquer momento.",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-purple-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
              Perguntas{" "}
              <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                frequentes
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Tudo o que você precisa saber sobre a plataforma Formulando e como ela 
              pode transformar seu marketing digital.
            </p>
            <Button
              asChild
              className={cn(
                "bg-gradient-to-r from-purple-700 to-purple-500",
                "hover:from-purple-800 hover:to-purple-600",
                "text-white border-0 shadow-lg shadow-purple-500/25"
              )}
            >
              <Link href="#contato">Fazer uma pergunta</Link>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-purple-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

