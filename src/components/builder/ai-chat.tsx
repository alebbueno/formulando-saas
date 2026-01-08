"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { generateFormWithAI } from "@/actions/form"
import { FormElementInstance } from "@/context/builder-context"
import { toast } from "sonner"

interface AIChatProps {
    open: boolean
    onClose: () => void
    onInsert: (elements: FormElementInstance[]) => void
}

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
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
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const result = await generateFormWithAI(input.trim())
            
            if (result.success && result.elements) {
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Formulário gerado com sucesso! ${result.elements.length} campos criados.`,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistantMessage])
                
                // Insert the generated elements
                onInsert(result.elements)
                toast.success("Formulário gerado com sucesso!")
                onClose()
            } else {
                const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: result.error || "Erro ao gerar formulário. Tente novamente.",
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
                toast.error(result.error || "Erro ao gerar formulário")
            }
        } catch (error) {
            console.error("Error generating form:", error)
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Erro ao gerar formulário. Tente novamente.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
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
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <Card className="border-t-2 rounded-t-2xl rounded-b-none shadow-2xl max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Gerador de Formulário com IA</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="space-y-4">
                            <div className="text-center text-muted-foreground">
                                <p className="mb-4">Descreva o formulário que você precisa e a IA criará para você!</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {QUICK_SUGGESTIONS.map((suggestion) => (
                                        <Badge
                                            key={suggestion}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-lg p-3",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg p-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ex: Quero captar leads para uma consultoria de marketing digital..."
                            disabled={loading}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            size="icon"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
