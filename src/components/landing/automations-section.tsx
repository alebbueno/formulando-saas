"use client"

import { Workflow, Mail, Clock, Zap, GitBranch, Target, CheckCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function AutomationsSection() {
  const automationTypes = [
    {
      icon: Mail,
      title: "E-mail Marketing",
      description: "Dispare e-mails automaticamente baseado em gatilhos",
      color: "from-blue-600 to-cyan-500",
    },
    {
      icon: Send,
      title: "Notificações",
      description: "Envie notificações para sua equipe em tempo real",
      color: "from-purple-600 to-pink-500",
    },
    {
      icon: GitBranch,
      title: "Condições Lógicas",
      description: "Crie fluxos com múltiplos caminhos e condições",
      color: "from-orange-600 to-red-500",
    },
    {
      icon: Clock,
      title: "Delays e Agendamentos",
      description: "Programe ações para executar no momento certo",
      color: "from-green-600 to-emerald-500",
    },
  ]

  const useCases = [
    {
      title: "Quando um lead preenche um formulário",
      steps: [
        "Enviar e-mail de boas-vindas",
        "Notificar equipe de vendas",
        "Adicionar ao CRM com tag 'novo lead'",
        "Agendar follow-up para 2 dias",
      ],
    },
    {
      title: "Quando um lead não responde",
      steps: [
        "Aguardar 3 dias",
        "Enviar e-mail de re-engajamento",
        "Se abrir: mover para 'interessado'",
        "Se não abrir: mover para 'frio'",
      ],
    },
  ]

  return (
    <section id="automacoes" className="py-20 lg:py-32 bg-gradient-to-b from-purple-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6">
              <Workflow className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-medium text-purple-700">
                Automações Visuais
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
              Automatize todo seu{" "}
              <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                processo de marketing
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Crie fluxos de automação completos sem código. Dispare e-mails, envie notificações, 
              integre com outras ferramentas e automatize toda sua comunicação com leads.
            </p>
          </div>

          {/* Visual Flow Builder Mockup */}
          <div className="mb-16">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-400 rounded-3xl blur-2xl opacity-20" />
              
              <div className="relative bg-white rounded-2xl border-2 border-purple-200 shadow-2xl shadow-purple-500/20 p-8 overflow-hidden">
                {/* Flow visualization */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {/* Trigger */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Gatilho</span>
                    <Badge variant="secondary" className="text-xs">
                      Novo Lead
                    </Badge>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                    <Zap className="w-5 h-5 text-purple-600 -mx-2" />
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                  </div>

                  {/* Action 1 */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Ação</span>
                    <Badge variant="secondary" className="text-xs">
                      Enviar E-mail
                    </Badge>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                    <Zap className="w-5 h-5 text-purple-600 -mx-2" />
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                  </div>

                  {/* Condition */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-500 flex items-center justify-center shadow-lg">
                      <GitBranch className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Condição</span>
                    <Badge variant="secondary" className="text-xs">
                      Se/Senão
                    </Badge>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                    <Zap className="w-5 h-5 text-purple-600 -mx-2" />
                    <div className="w-8 h-0.5 bg-purple-300"></div>
                  </div>

                  {/* Success */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Conclusão</span>
                    <Badge variant="secondary" className="text-xs">
                      Lead Qualificado
                    </Badge>
                  </div>
                </div>

                {/* Info text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  Editor visual drag-and-drop para criar fluxos complexos
                </p>
              </div>
            </div>
          </div>

          {/* Automation Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {automationTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <Card
                  key={index}
                  className="border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer p-6"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4",
                    "shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300",
                    type.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type.description}
                  </p>
                </Card>
              )
            })}
          </div>

          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-2 border-purple-100 p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4 flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  {useCase.title}
                </h3>
                <ul className="space-y-3">
                  {useCase.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 lg:p-12 border-2 border-purple-200">
            <Workflow className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Automatize seu marketing hoje mesmo
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Crie fluxos ilimitados de automação sem código. Economize horas de trabalho manual 
              e nunca mais perca um lead por falta de follow-up.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition-all hover:shadow-lg hover:scale-105"
            >
              Criar Minha Primeira Automação
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

