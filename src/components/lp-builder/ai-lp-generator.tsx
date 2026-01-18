"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Sparkles, Wand2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { generateLPWithAI } from "@/actions/generate-lp"
import { useLPBuilder } from "./context/lp-builder-context"
import { toast } from "sonner"
import { LoadingOverlay } from "@/components/builder/loading-overlay"

interface AILPGeneratorProps {
    open: boolean
    onClose: () => void
}

const QUICK_SUGGESTIONS = [
    "Página de Vendas Curso Online",
    "Webinar de Marketing",
    "E-book Gratuito",
    "Agência de Marketing",
    "Lançamento de Produto",
    "Captura de Leads Imobiliária"
]

export function AILPGenerator({ open, onClose }: AILPGeneratorProps) {
    const { setElements, elements } = useLPBuilder()
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        setLoading(true)

        try {
            // Depending on logic, we might want to pass current elements for "edit" mode
            // For now, we are treating this as primarily a "Generate new" or "Regenerate" feature
            const result = await generateLPWithAI(input.trim(), elements)

            if (result.success && result.elements) {
                setElements(result.elements)
                toast.success(`Landing Page gerada com sucesso!`)
                onClose()
                setInput("")
            } else {
                toast.error(result.error || "Erro ao gerar Landing Page")
            }
        } catch (error) {
            console.error("Error generating LP:", error)
            toast.error("Erro ao processar solicitação")
        } finally {
            setLoading(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
        if (inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const LP_TIPS = [
        "Dica: Títulos claros aumentam a conversão em até 30%.",
        "Dica: Use provas sociais para gerar confiança.",
        "Dica: Otimize para mobile, a maioria dos usuários acessa pelo celular.",
        "Dica: Mantenha o formulário simples e direto.",
        "Dica: Utilize cores contrastantes para o botão de ação (CTA).",
        "Dica: Foque nos benefícios, não apenas nas características.",
        "Dica: Adicione uma garantia para reduzir o risco percebido."
    ]

    if (loading) {
        return <LoadingOverlay message="Criando sua Landing Page..." tips={LP_TIPS} />
    }

    if (!open) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-3xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-2 top-2 h-6 w-6 rounded-full hover:bg-muted text-muted-foreground z-10"
                    >
                        <X className="h-3 w-3" />
                    </Button>

                    <div className="p-1">
                        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
                                <Sparkles className="h-3 w-3" /> Sugestões:
                            </span>
                            {QUICK_SUGGESTIONS.map((suggestion) => (
                                <Badge
                                    key={suggestion}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all text-xs py-0.5 px-2 bg-muted/50 border-muted-foreground/20"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 p-2 pl-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <Wand2 className="h-5 w-5 text-primary-foreground" />
                            </div>

                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Descreva sua Landing Page... (ex: 'Página de vendas de café')"
                                className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/50 h-auto py-2"
                            />

                            <Button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                size="sm"
                                className="h-10 px-6 rounded-xl font-semibold shadow-sm transition-all text-background hover:scale-105 active:scale-95"
                            >
                                Gerar Mágica
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
