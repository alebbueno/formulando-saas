"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles, Users, Workflow, BarChart3 } from "lucide-react"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-white -z-10" />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-8",
              "transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span className="text-sm font-medium text-purple-700">
              Plataforma completa de marketing e automação
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 mb-6",
              "transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Sua máquina de{" "}
            <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 bg-clip-text text-transparent animate-gradient">
              captação e conversão
            </span>{" "}
            completa
          </h1>

          {/* Sub-headline */}
          <p
            className={cn(
              "text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed",
              "transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Crie formulários, landing pages, capture leads, automatize processos e gerencie
            tudo em um único lugar. A plataforma all-in-one para escalar seu marketing digital.
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",
              "transition-all duration-700 delay-400",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button
              asChild
              size="lg"
              className={cn(
                "bg-gradient-to-r from-purple-700 to-purple-500",
                "hover:from-purple-800 hover:to-purple-600",
                "text-white border-0 shadow-lg shadow-purple-500/30",
                "hover:shadow-purple-500/50 hover:scale-105",
                "text-base px-8 py-6 h-auto",
                "transition-all duration-300",
                "group relative overflow-hidden"
              )}
            >
              <Link href="/signup">
                <span className="relative z-10">Começar Grátis</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "border-2 border-gray-300 text-gray-700",
                "hover:bg-gray-50 hover:border-gray-400",
                "text-base px-8 py-6 h-auto",
                "hover:scale-105 transition-all duration-300"
              )}
            >
              <Link href="#demo">Ver Demonstração</Link>
            </Button>
          </div>

          {/* Quick Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Gestão de Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-purple-600" />
              <span>Automações</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Analytics em tempo real</span>
            </div>
          </div>

          {/* Placeholder for hero image/mockup with enhanced styling */}
          <div
            className={cn(
              "relative mt-12",
              "transition-all duration-1000 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur-xl opacity-20" />
              
              <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-200 shadow-2xl shadow-purple-500/20 flex items-center justify-center overflow-hidden group">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-4xl font-bold">F</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Imagem do builder será adicionada aqui
                  </p>
                </div>
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

