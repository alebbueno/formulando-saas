"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutTemplate, PenTool, Loader2 } from "lucide-react"
import { generateFormWithAI } from "@/actions/form"
import { FormElementInstance } from "@/context/builder-context"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

interface OnboardingModalProps {
    onInsertAI: (elements: FormElementInstance[]) => void
    onOpenTemplates: () => void
}

export function OnboardingModal({ onInsertAI, onOpenTemplates }: OnboardingModalProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'selection' | 'ai-input'>('selection')
    const [aiPrompt, setAiPrompt] = useState("")
    const [loading, setLoading] = useState(false)

    const pathname = usePathname()

    useEffect(() => {
        if (searchParams?.get("onboarding") === "true") {
            setOpen(true)
        }
    }, [searchParams])

    const handleClose = () => {
        setOpen(false)
        // Remove onboarding param
        const params = new URLSearchParams(searchParams?.toString())
        params.delete("onboarding")
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return
        setLoading(true)
        try {
            const result = await generateFormWithAI(aiPrompt.trim(), [])
            if (result.success && result.elements) {
                onInsertAI(result.elements)
                toast.success("Formulário gerado com sucesso!")
                handleClose()
            } else {
                toast.error(result.error || "Erro ao gerar formulário")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao gerar formulário")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl">
                {step === 'selection' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center mb-2">
                                Como você deseja começar?
                            </DialogTitle>
                            <DialogDescription className="text-center text-lg">
                                Escolha a melhor forma de criar seu formulário.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                            {/* AI Option */}
                            <button
                                onClick={() => setStep('ai-input')}
                                className="flex flex-col items-center p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all group"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Usar IA</h3>
                                <p className="text-sm text-center text-muted-foreground">
                                    Descreva o que precisa e a IA cria para você.
                                </p>
                            </button>

                            {/* Template Option */}
                            <button
                                onClick={() => {
                                    handleClose()
                                    onOpenTemplates()
                                }}
                                className="flex flex-col items-center p-6 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                            >
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4 text-secondary-foreground group-hover:scale-110 transition-transform">
                                    <LayoutTemplate className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">Templates</h3>
                                <p className="text-sm text-center text-muted-foreground">
                                    Escolha um modelo pronto da nossa galeria.
                                </p>
                            </button>

                            {/* Scratch Option */}
                            <button
                                onClick={handleClose}
                                className="flex flex-col items-center p-6 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                            >
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4 text-secondary-foreground group-hover:scale-110 transition-transform">
                                    <PenTool className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">Do Zero</h3>
                                <p className="text-sm text-center text-muted-foreground">
                                    Comece com uma tela em branco.
                                </p>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setStep('selection')} className="-ml-2">
                                    <span className="sr-only">Voltar</span>
                                    ←
                                </Button>
                                Descreva seu formulário
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <Textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ex: Um formulário de inscrição para um evento de marketing, com nome, email, empresa e cargo. Quero também saber como conheceram o evento."
                                className="min-h-[150px] text-lg p-4 resize-none focus-visible:ring-primary"
                                autoFocus
                            />
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground">Sugestões:</span>
                                {["Pesquisa de Satisfação", "Cadastro de Cliente", "Contato Comercial", "Feedback de Produto"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setAiPrompt(s)}
                                        className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleGenerateAI}
                                disabled={!aiPrompt.trim() || loading}
                                className="w-full sm:w-auto"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Gerando Mágica..." : "Gerar Formulário"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
