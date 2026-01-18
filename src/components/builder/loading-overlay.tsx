"use client"

import { useState, useEffect } from "react"
import { Loader2, Sparkles, Lightbulb } from "lucide-react"

const DEFAULT_TIPS = [
    "Dica: Formulários curtos têm taxas de conversão até 120% maiores.",
    "Dica: Peça o e-mail logo no início para reduzir o atrito.",
    "Dica: Use títulos claros e diretos para orientar o usuário.",
    "Dica: Evite campos opcionais se eles não forem essenciais.",
    "Dica: Ofereça um incentivo (lead magnet) em troca dos dados.",
    "Dica: Use provas sociais (depoimentos) perto do botão de envio.",
    "Dica: Otimize para mobile! 60% dos acessos são por celular."
]

interface LoadingOverlayProps {
    message?: string
    tips?: string[]
}

export function LoadingOverlay({ message = "Criando seu formulário...", tips = DEFAULT_TIPS }: LoadingOverlayProps) {
    const [tipIndex, setTipIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % tips.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [tips])

    return (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center max-w-md p-8 text-center space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative h-24 w-24 bg-background border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{message}</h3>
                    <div className="h-16 flex items-center justify-center">
                        <p className="text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 key-[tipIndex]">
                            <Lightbulb className="inline-block h-4 w-4 mr-2 text-yellow-500 mb-0.5" />
                            {tips[tipIndex]}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
