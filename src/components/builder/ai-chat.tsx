"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, Sparkles, Loader2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { ScrollArea } from "@/components/ui/scroll-area" // Unused in this new design
import { Badge } from "@/components/ui/badge"
import { generateFormWithAI } from "@/actions/form"
import { FormElementInstance } from "@/context/builder-context"
import { toast } from "sonner"

interface AIChatProps {
    open: boolean
    onClose: () => void
    onInsert: (elements: FormElementInstance[]) => void
}

const QUICK_SUGGESTIONS = [
    "Captação de leads",
    "Evento",
    "Vendas",
    "Suporte",
    "Pesquisa de satisfação",
    "Cadastro de usuário"
]

export function AIChat({ open, onClose, onInsert }: AIChatProps) {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open && inputRef.current) {
            // Small delay to allow animation to start
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        setLoading(true)

        try {
            const result = await generateFormWithAI(input.trim())

            if (result.success && result.elements) {
                onInsert(result.elements)
                toast.success(`Formulário gerado com ${result.elements.length} campos!`)
                onClose()
                setInput("")
            } else {
                toast.error(result.error || "Erro ao gerar formulário")
            }
        } catch (error) {
            console.error("Error generating form:", error)
            toast.error("Erro ao gerar formulário")
        } finally {
            setLoading(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!open) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-3xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
                    {/* Close button absolute */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-2 top-2 h-6 w-6 rounded-full hover:bg-muted text-muted-foreground z-10"
                    >
                        <X className="h-3 w-3" />
                    </Button>

                    <div className="p-1">
                        {/* Suggestions */}
                        {!loading && (
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
                        )}

                        {/* Input Area */}
                        <div className="flex items-center gap-3 p-2 pl-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                {loading ? (
                                    <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                                ) : (
                                    <Wand2 className="h-5 w-5 text-primary-foreground" />
                                )}
                            </div>

                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={loading ? "Criando seu formulário..." : "Descreva o formulário... (ex: 'Cadastro de leads para imobiliária')"}
                                disabled={loading}
                                className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/50 h-auto py-2"
                            />

                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                size="sm"
                                className="h-10 px-6 rounded-xl font-semibold shadow-sm transition-all text-background hover:scale-105 active:scale-95"
                            >
                                {loading ? "Gerando..." : "Criar"}
                            </Button>
                        </div>
                    </div>

                    {/* Progress indicator line if loading */}
                    {loading && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                            <div className="h-full bg-primary animate-progress-indeterminate origin-left" />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
