"use client"

import { Database, Mail, Cloud } from "lucide-react"
import { SiZapier, SiNotion, SiGooglesheets } from "react-icons/si"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function IntegrationsShowcaseSection() {
  const integrations = [
    { name: "Zapier", icon: SiZapier, color: "from-orange-500 to-orange-600", isReactIcon: true },
    { name: "Notion", icon: SiNotion, color: "from-gray-800 to-gray-900", isReactIcon: true },
    { name: "Google Sheets", icon: SiGooglesheets, color: "from-green-600 to-green-700", isReactIcon: true },
    { name: "Webhooks", icon: Database, color: "from-blue-600 to-blue-700", isReactIcon: false },
    { name: "E-mail SMTP", icon: Mail, color: "from-red-600 to-red-700", isReactIcon: false },
    { name: "API REST", icon: Cloud, color: "from-cyan-600 to-cyan-700", isReactIcon: false },
  ]

  return (
    <section id="integracoes" className="py-20 lg:py-32 bg-gradient-to-b from-purple-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Integre com{" "}
            <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              qualquer ferramenta
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conecte o Formulando com milhares de aplicativos através de integrações nativas, 
            Zapier, Make ou nossa API REST. Seus dados, onde você quiser.
          </p>
        </div>

        {/* Integration cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto mb-12">
          {integrations.map((integration, index) => {
            const Icon = integration.icon
            return (
              <Card
                key={index}
                className={cn(
                  "border-2 border-gray-100 hover:border-purple-200",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10",
                  "hover:-translate-y-2 group cursor-pointer p-6",
                  "flex flex-col items-center justify-center gap-3"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  "shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300",
                  integration.color
                )}>
                  <Icon className={cn("text-white", integration.isReactIcon ? "w-8 h-8" : "w-7 h-7")} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors text-center">
                  {integration.name}
                </span>
              </Card>
            )
          })}
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {[
            {
              title: "Webhooks Instantâneos",
              description: "Receba dados em tempo real em qualquer endpoint HTTP",
            },
            {
              title: "API REST Completa",
              description: "Integração total via API para desenvolvedores",
            },
            {
              title: "Automações Zapier/Make",
              description: "Conecte com 5000+ apps sem código",
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-700 to-purple-600 rounded-2xl p-8 lg:p-12 text-white shadow-2xl shadow-purple-500/30">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            Comece a captar mais leads hoje mesmo
          </h3>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já usam o Formulando para 
            captar, gerenciar e converter leads automaticamente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-50 transition-all hover:shadow-xl hover:scale-105"
            >
              Teste Grátis por 7 Dias
            </Link>
            <Link
              href="/precos"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              Conhecer Planos
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

