"use client"

import { Zap, Users, TrendingUp } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function WhatsAppWidgetSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-green-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 mb-6">
                <FaWhatsapp className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">
                  Widget WhatsApp
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                Conecte seu site ao{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Botão flutuante que abre um formulário personalizado para capturar informações 
                dos visitantes. Após o preenchimento, o lead é direcionado automaticamente 
                para conversar com você no WhatsApp.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: Zap,
                    title: "Instalação em minutos",
                    description: "Adicione o widget em seu site com um simples código",
                  },
                  {
                    icon: Users,
                    title: "Formulário personalizado",
                    description: "Configure campos customizados para capturar as informações certas",
                  },
                  {
                    icon: TrendingUp,
                    title: "Conversão automática",
                    description: "Lead cadastrado e direcionado ao WhatsApp automaticamente",
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                asChild
                className={cn(
                  "bg-gradient-to-r from-green-600 to-emerald-500",
                  "hover:from-green-700 hover:to-emerald-600",
                  "text-white border-0 shadow-lg shadow-green-500/30",
                  "hover:shadow-green-500/50 hover:scale-105 transition-all"
                )}
              >
                <Link href="/signup">
                  Experimentar Agora
                </Link>
              </Button>
            </div>

            {/* Visual/Mockup */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-emerald-400 rounded-2xl blur-2xl opacity-20" />
                
                {/* Mockup */}
                <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-2xl shadow-green-500/10 p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 relative overflow-hidden">
                    {/* Simulated browser/phone screen */}
                    <div className="absolute bottom-6 right-6">
                      <div className="relative">
                        {/* Chat bubble */}
                        <div className="absolute bottom-20 right-0 bg-white rounded-2xl rounded-br-none shadow-xl p-4 w-64 animate-in slide-in-from-bottom duration-500">
                          <p className="text-sm text-gray-700 mb-2">
                            Olá! 👋 Como posso ajudar?
                          </p>
                          <span className="text-xs text-gray-500">Agora mesmo</span>
                        </div>
                        
                        {/* WhatsApp Button */}
                        <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl shadow-green-500/50 cursor-pointer hover:scale-110 transition-transform animate-bounce">
                          <FaWhatsapp className="w-9 h-9 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="h-64"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

