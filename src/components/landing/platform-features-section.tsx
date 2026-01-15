"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Layout, Users, Workflow, Plug } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { cn } from "@/lib/utils"

export function PlatformFeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Formulários Inteligentes",
      description:
        "Crie formulários profissionais com nosso editor visual drag-and-drop. Templates prontos, IA integrada e campos personalizados para capturar exatamente o que você precisa.",
      gradient: "from-purple-600 to-blue-500",
      stats: "15+ tipos de campos",
      isReactIcon: false,
    },
    {
      icon: Layout,
      title: "Landing Pages",
      description:
        "Construa páginas de captura de alta conversão sem código. Editor visual completo com blocos personalizáveis e templates otimizados para conversão.",
      gradient: "from-purple-500 to-pink-500",
      stats: "Conversão otimizada",
      isReactIcon: false,
    },
    {
      icon: Users,
      title: "Gestão de Leads",
      description:
        "CRM completo com Kanban, pipeline de vendas, tags, anotações e histórico completo. Organize e qualifique seus leads de forma profissional.",
      gradient: "from-blue-600 to-cyan-500",
      stats: "CRM integrado",
      isReactIcon: false,
    },
    {
      icon: Workflow,
      title: "Automações Visuais",
      description:
        "Crie fluxos de automação sem código. Envie e-mails, notificações, integre com outras ferramentas e automatize todo seu processo de vendas.",
      gradient: "from-purple-700 to-purple-500",
      stats: "Fluxos ilimitados",
      isReactIcon: false,
    },
    {
      icon: FaWhatsapp,
      title: "Widget WhatsApp",
      description:
        "Botão flutuante para captura de leads direto no WhatsApp. Configure mensagens automáticas e capture leads em tempo real no app mais usado do Brasil.",
      gradient: "from-green-600 to-emerald-500",
      stats: "Captura em tempo real",
      isReactIcon: true,
    },
    {
      icon: Plug,
      title: "Integrações Poderosas",
      description:
        "Conecte com Zapier, Make, Google Sheets, CRMs e mais. Envie seus dados para qualquer lugar e integre o Formulando ao seu stack de ferramentas.",
      gradient: "from-orange-500 to-red-500",
      stats: "20+ integrações",
      isReactIcon: false,
    },
  ]

  return (
    <section id="funcionalidades" className="py-20 lg:py-32 bg-gradient-to-b from-white to-purple-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Tudo que você precisa para{" "}
            <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              escalar seu marketing
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Uma plataforma completa com todas as ferramentas que você precisa para captar, 
            converter e gerenciar leads de forma profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={cn(
                  "border-2 border-gray-100 hover:border-purple-200",
                  "transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10",
                  "hover:-translate-y-2 group cursor-pointer",
                  "relative overflow-hidden"
                )}
              >
                {/* Gradient overlay on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                  feature.gradient
                )} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      "shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300",
                      feature.gradient
                    )}>
                      <Icon className={cn("text-white", feature.isReactIcon ? "w-8 h-8" : "w-7 h-7")} />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                      {feature.stats}
                    </span>
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-purple-700 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Bottom accent */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                  feature.gradient,
                  "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                )} />
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

