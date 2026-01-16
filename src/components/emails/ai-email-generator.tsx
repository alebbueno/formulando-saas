"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { generateEmailWithAI, GenerateEmailResult } from "@/actions/generate-email"
import { EmailPreview } from "./email-preview"
import { toast } from "sonner"
import { Sparkles, Loader2, Wand2, Lightbulb, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AIEmailGeneratorProps {
    onUseGenerated: (result: GenerateEmailResult) => void
}

export function AIEmailGenerator({ onUseGenerated }: AIEmailGeneratorProps) {
    const [prompt, setPrompt] = useState("")
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState<GenerateEmailResult | null>(null)

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Digite uma descrição do email")
            return
        }

        setGenerating(true)
        try {
            const result = await generateEmailWithAI(prompt)
            setGenerated(result)
            toast.success("Email gerado com sucesso!")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao gerar email. Tente novamente.")
        } finally {
            setGenerating(false)
        }
    }

    const handleUse = () => {
        if (generated) {
            onUseGenerated(generated)
            toast.success("Template carregado!")
        }
    }

    const examplePrompts = [
        "Email para agendar demo com CTO de startup de tecnologia",
        "Follow-up sutil após reunião comercial sem resposta",
        "Apresentação de novo produto para clientes da base",
        "Convite para webinar exclusivo sobre marketing",
    ]

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center space-y-2 py-4">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                    <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Criador Mágico de Emails</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Transforme suas ideias em emails profissionais em segundos usando inteligência artificial avançada.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm overflow-hidden ring-1 ring-border/50">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="prompt" className="text-base font-medium flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    O que você quer escrever?
                                </Label>
                                <Textarea
                                    id="prompt"
                                    placeholder="Ex: Escreva um email persuasivo oferecendo uma consultoria gratuita de SEO para um e-commerce de moda..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[160px] resize-none text-base p-4 border-muted-foreground/20 focus-visible:ring-primary/20 transition-all font-medium leading-relaxed"
                                    disabled={generating}
                                />
                            </div>

                            <div className="space-y-3">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Lightbulb className="w-3 h-3" /> Sugestões
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {examplePrompts.map((example, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(example)}
                                            disabled={generating}
                                            className="text-xs bg-muted/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 border border-transparent px-3 py-1.5 rounded-full transition-all text-left truncate max-w-full"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={generating || !prompt.trim()}
                                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                                size="lg"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Criando mágica...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Gerar Email
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right: Preview Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <AnimatePresence mode="wait">
                        {!generated ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-xl bg-muted/5"
                            >
                                <div className="text-center space-y-4 max-w-xs p-6">
                                    <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto">
                                        <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <h4 className="font-medium text-muted-foreground">O resultado aparecerá aqui</h4>
                                    <p className="text-sm text-muted-foreground/60">
                                        Experimente descrever o objetivo do seu email e veja a IA trabalhar.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-background rounded-xl border shadow-lg overflow-hidden ring-1 ring-border/50">
                                    <div className="bg-muted/30 border-b px-4 py-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/20" />
                                        </div>
                                    </div>
                                    <div className="p-1">
                                        <EmailPreview
                                            subject={generated.subject}
                                            bodyHtml={generated.body}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleUse}
                                    className="w-full h-12 text-base shadow-md group"
                                    variant="secondary"
                                >
                                    Usar este resultado
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}
