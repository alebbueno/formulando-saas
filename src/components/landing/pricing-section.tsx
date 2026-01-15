"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function PricingSection() {
  const plans = [
    {
      name: "Growth",
      slug: "growth",
      icon: Zap,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      price: 249,
      description: "Para agências que estão estruturando sua operação",
      features: [
        "Até 3 workspaces",
        "Formulários ilimitados",
        "Até 10 landing pages",
        "Até 5.000 leads/mês",
        "Funil de vendas completo",
        "Branding removido",
        "2.000 emails/mês",
        "IA de qualificação básica"
      ],
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonText: "Começar Teste Grátis"
    },
    {
      name: "Scale",
      slug: "scale",
      icon: Star,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      price: 549,
      description: "Para agências em crescimento que atendem múltiplos clientes",
      features: [
        "Até 10 workspaces",
        "Landing pages ilimitadas",
        "Até 25.000 leads/mês",
        "Automações ilimitadas",
        "Domínio próprio",
        "White-label parcial",
        "10.000 emails/mês",
        "IA de qualificação avançada"
      ],
      highlighted: true,
      badge: "MAIS POPULAR",
      buttonVariant: "default" as const,
      buttonText: "Começar Teste Grátis"
    },
    {
      name: "Agency Pro",
      slug: "agency-pro",
      icon: ShieldCheck,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      price: 899,
      description: "Infraestrutura completa de captação para agências maduras",
      features: [
        "Workspaces ilimitados",
        "Leads ilimitados",
        "White-label completo",
        "Multi-domínio",
        "Permissões por usuário",
        "Suporte prioritário máximo",
        "30.000 emails/mês",
        "IA de qualificação estendida"
      ],
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonText: "Começar Teste Grátis"
    }
  ]

  return (
    <section id="precos" className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Preços Transparentes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Planos que crescem com você
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua agência. Todos com <strong>7 dias de teste grátis</strong>, sem cartão de crédito.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.slug}
                className={cn(
                  "flex flex-col relative transition-all duration-300",
                  plan.highlighted
                    ? "border-purple-500 shadow-2xl shadow-purple-500/20 scale-105 md:scale-110 z-10"
                    : "hover:border-gray-300 hover:shadow-lg"
                )}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-bl-lg rounded-tr-xl shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md", plan.bgColor)}>
                    <Icon className={cn("h-7 w-7", plan.iconColor, plan.highlighted && "fill-current")} />
                  </div>
                  
                  <CardTitle className={cn("text-2xl", plan.highlighted && "text-purple-600 dark:text-purple-400")}>
                    {plan.name}
                  </CardTitle>
                  
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-5xl font-bold">R$ {plan.price}</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                  
                  <CardDescription className="mt-3 text-base leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={cn(
                          "h-5 w-5 flex-shrink-0 mt-0.5",
                          plan.highlighted ? "text-purple-600" : "text-primary"
                        )} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    asChild
                    variant={plan.buttonVariant}
                    className={cn(
                      "w-full h-12 text-base font-semibold transition-all",
                      plan.highlighted && "bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                    )}
                  >
                    <Link href="/signup">{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison Table - Simplified for landing */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12 border-2 border-purple-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-3">Comparativo Rápido</h3>
              <p className="text-gray-600">Veja o que cada plano oferece</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="font-bold text-lg text-blue-600">Growth</div>
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-gray-600">Workspaces</div>
                <div className="text-2xl font-bold mt-4">5K</div>
                <div className="text-sm text-gray-600">Leads/mês</div>
              </div>
              
              <div className="text-center space-y-2 bg-white rounded-xl p-4 shadow-lg border-2 border-purple-200">
                <div className="font-bold text-lg text-purple-600">Scale</div>
                <div className="text-3xl font-bold">10</div>
                <div className="text-sm text-gray-600">Workspaces</div>
                <div className="text-2xl font-bold mt-4">25K</div>
                <div className="text-sm text-gray-600">Leads/mês</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="font-bold text-lg text-orange-600">Agency Pro</div>
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-gray-600">Workspaces</div>
                <div className="text-2xl font-bold mt-4">∞</div>
                <div className="text-sm text-gray-600">Leads/mês</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Teste grátis por 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Suporte em português</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Junte-se a centenas de agências que já modernizaram sua operação de captação e automação com o Formulando
          </p>
        </div>
      </div>
    </section>
  )
}

