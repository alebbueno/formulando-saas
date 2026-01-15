"use client"

import { BarChart3, TrendingUp, Users, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSection() {
  const stats = [
    {
      icon: Users,
      value: "Leads",
      description: "Capture e gerencie",
      color: "from-blue-600 to-cyan-500",
    },
    {
      icon: TrendingUp,
      value: "Conversões",
      description: "Acompanhe em tempo real",
      color: "from-purple-600 to-pink-500",
    },
    {
      icon: Target,
      value: "Funil",
      description: "Visualize seu pipeline",
      color: "from-orange-600 to-red-500",
    },
    {
      icon: BarChart3,
      value: "Analytics",
      description: "Métricas detalhadas",
      color: "from-green-600 to-emerald-500",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual/Dashboard Mockup */}
            <div>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-400 rounded-2xl blur-2xl opacity-20" />
                
                {/* Dashboard mockup */}
                <div className="relative bg-white rounded-2xl border-2 border-purple-200 shadow-2xl shadow-purple-500/20 p-6 overflow-hidden">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h3 className="font-bold text-lg text-gray-900">Dashboard</h3>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3",
                              stat.color
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {stat.value}
                            </div>
                            <div className="text-xs text-gray-600">
                              {stat.description}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Chart placeholder */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 h-32 flex items-end gap-2">
                      {[40, 70, 45, 90, 60, 85, 55].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:scale-105"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                Tome decisões baseadas em{" "}
                <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                  dados reais
                </span>
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Dashboard completo com métricas em tempo real. Acompanhe conversões, 
                leads, funil de vendas e muito mais em um único lugar.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Métricas em tempo real",
                    description: "Veja seus resultados atualizando ao vivo enquanto você trabalha",
                  },
                  {
                    title: "Funil visual de conversão",
                    description: "Identifique gargalos e otimize cada etapa do seu processo",
                  },
                  {
                    title: "Relatórios personalizados",
                    description: "Crie relatórios sob medida para sua equipe e stakeholders",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-600 mt-2 group-hover:scale-150 transition-transform" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

