"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Sparkles, Code2, ArrowRight } from "lucide-react"

interface EmailCreationModeSelectorProps {
    onSelectMode: (mode: 'templates' | 'ai' | 'manual') => void
}

export function EmailCreationModeSelector({ onSelectMode }: EmailCreationModeSelectorProps) {
    const modes = [
        {
            id: 'templates' as const,
            icon: FileText,
            title: 'Templates Prontos',
            description: 'Escolha entre templates profissionais pré-configurados',
            gradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-600',
            buttonText: 'Escolher Template',
        },
        {
            id: 'ai' as const,
            icon: Sparkles,
            title: 'Criar com IA',
            description: 'Descreva seu email e deixe a IA criar para você',
            gradient: 'from-purple-500/10 to-pink-500/10',
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-600',
            buttonText: 'Usar IA',
        },
        {
            id: 'manual' as const,
            icon: Code2,
            title: 'Criar Sozinho',
            description: 'Comece do zero com o editor completo',
            gradient: 'from-slate-500/10 to-zinc-500/10',
            iconBg: 'bg-slate-500/10',
            iconColor: 'text-slate-600',
            buttonText: 'Começar do Zero',
        },
    ]

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8">
            <div className="w-full max-w-6xl space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3"
                >
                    <h2 className="text-3xl font-bold tracking-tight">Como você quer criar seu email?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Escolha a melhor forma de começar seu email marketing
                    </p>
                </motion.div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modes.map((mode, index) => {
                        const Icon = mode.icon
                        return (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer relative overflow-hidden"
                                    onClick={() => onSelectMode(mode.id)}
                                >
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <CardHeader className="relative space-y-4">
                                        <div className={`w-16 h-16 rounded-2xl ${mode.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`w-8 h-8 ${mode.iconColor}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                {mode.title}
                                            </CardTitle>
                                            <CardDescription className="text-base leading-relaxed">
                                                {mode.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="relative">
                                        <Button
                                            className="w-full group/btn"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelectMode(mode.id)
                                            }}
                                        >
                                            {mode.buttonText}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Helper Text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-muted-foreground"
                >
                    Você poderá editar e personalizar seu email depois de escolher
                </motion.p>
            </div>
        </div>
    )
}
