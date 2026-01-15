"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Pronto para escalar seu marketing digital?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já estão capturando e convertendo 
            mais leads com o Formulando. Comece gratuitamente hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className={cn(
                "bg-white text-purple-700",
                "hover:bg-gray-50",
                "border-0 shadow-lg shadow-purple-900/25",
                "text-base px-8 py-6 h-auto",
                "group"
              )}
            >
              <Link href="/signup">
                Começar Teste Grátis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "bg-transparent text-white border-2 border-white",
                "hover:bg-white hover:text-purple-700",
                "text-base px-8 py-6 h-auto",
                "transition-all"
              )}
            >
              <Link href="#precos">
                Ver Planos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

