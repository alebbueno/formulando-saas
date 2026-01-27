"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/events"
import { FileText, LayoutTemplate, MessageCircle, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { createOnboardingProject, createOnboardingLP } from "../actions"
import { toast } from "sonner"

export default function OnboardingStartPage() {
    const router = useRouter()
    const [loadingAction, setLoadingAction] = useState<string | null>(null)

    useEffect(() => {
        trackEvent("first_action_screen_viewed")
    }, [])

    const handleAction = async (action: 'form' | 'lp' | 'whatsapp') => {
        if (loadingAction) return

        setLoadingAction(action)
        trackEvent("first_action_selected", { action })

        try {
            if (action === 'form') {
                await createOnboardingProject()
            } else if (action === 'lp') {
                await createOnboardingLP()
            } else if (action === 'whatsapp') {
                // Assuming simple client navigation is enough for now, 
                // or we might need to set some state? defaulting to navigation.
                router.push('/dashboard/whatsapp')
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao iniciar.")
            setLoadingAction(null)
        }
    }

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Agora vamos captar seu primeiro lead
                </h1>
                <p className="text-muted-foreground">
                    Escolha como você quer começar. Você pode configurar o resto depois.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Option 1: Form (Recommended) */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleAction('form')}
                    disabled={!!loadingAction}
                    className={cn(
                        "relative flex flex-col items-center p-8 text-center h-full",
                        "bg-card hover:bg-accent/50 border-2 rounded-xl transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl",
                        "border-primary shadow-lg shadow-primary/10", // Highlight
                        "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        loadingAction && loadingAction !== 'form' && "opacity-50 blur-[1px]",
                        loadingAction === 'form' && "scale-[1.02] border-primary"
                    )}
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Recomendado
                    </div>

                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        {loadingAction === 'form' ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <FileText className="w-8 h-8" />
                        )}
                    </div>
                    <h3 className="font-bold text-xl mb-2">Criar formulário</h3>
                    <p className="text-sm text-muted-foreground">
                        Perfeito para integrar em sites existentes ou usar como link direto.
                    </p>
                </motion.button>

                {/* Option 2: LP */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleAction('lp')}
                    disabled={!!loadingAction}
                    className={cn(
                        "flex flex-col items-center p-8 text-center h-full",
                        "bg-card hover:bg-accent/50 border rounded-xl transition-all duration-200",
                        "hover:scale-105 hover:shadow-lg hover:border-primary/50",
                        "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        loadingAction && loadingAction !== 'lp' && "opacity-50 blur-[1px]"
                    )}
                >
                    <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        {loadingAction === 'lp' ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <LayoutTemplate className="w-8 h-8" />
                        )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Criar landing page</h3>
                    <p className="text-sm text-muted-foreground">
                        Uma página completa para apresentar seu produto ou serviço.
                    </p>
                </motion.button>

                {/* Option 3: WhatsApp */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => handleAction('whatsapp')}
                    disabled={!!loadingAction}
                    className={cn(
                        "flex flex-col items-center p-8 text-center h-full",
                        "bg-card hover:bg-accent/50 border rounded-xl transition-all duration-200",
                        "hover:scale-105 hover:shadow-lg hover:border-primary/50",
                        "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        loadingAction && loadingAction !== 'whatsapp' && "opacity-50 blur-[1px]"
                    )}
                >
                    <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-6 group-hover:bg-green-500/10 group-hover:text-green-600 transition-colors">
                        {loadingAction === 'whatsapp' ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <MessageCircle className="w-8 h-8" />
                        )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Botão de WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                        Adicione um botão flutuante de chat no seu site.
                    </p>
                </motion.button>
            </div>
        </div>
    )
}
