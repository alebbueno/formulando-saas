"use client"

import { CheckCircle2, Circle, ArrowRight, Share2, PartyPopper } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardChecklistProps {
    hasProjects: boolean
    hasPublishedProjects: boolean
    hasLeads: boolean
}

export function DashboardChecklist({ hasProjects, hasPublishedProjects, hasLeads }: DashboardChecklistProps) {
    const steps = [
        {
            id: "account",
            label: "Criar conta",
            description: "Você já deu o primeiro passo!",
            completed: true,
        },
        {
            id: "create",
            label: "Criar primeiro formulário",
            description: "Use a IA ou comece do zero.",
            completed: hasProjects,
            action: !hasProjects ? (
                <Button size="sm" variant="outline" asChild>
                    <Link href="/onboarding/start">Criar agora</Link>
                </Button>
            ) : null
        },
        {
            id: "publish",
            label: "Publicar formulário",
            description: "Deixe seu formulário visível para o mundo.",
            completed: hasPublishedProjects,
            action: (hasProjects && !hasPublishedProjects) ? (
                <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard">Ir para Meus Projetos</Link>
                </Button>
            ) : null
        },
        {
            id: "lead",
            label: "Receber primeiro lead",
            description: "Compartilhe o link e aguarde as respostas.",
            completed: hasLeads,
            action: (hasPublishedProjects && !hasLeads) ? (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard">
                            <Share2 className="mr-2 h-3 w-3" />
                            Compartilhar
                        </Link>
                    </Button>
                </div>
            ) : null
        }
    ]

    const completedCount = steps.filter(s => s.completed).length
    const progress = (completedCount / steps.length) * 100
    const allCompleted = completedCount === steps.length

    if (allCompleted) return null // Hide if everything is done (or maybe show a mini "All set!" version)

    return (
        <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                            Vamos colocar sua máquina para rodar! 🚀
                        </CardTitle>
                        <CardDescription className="text-blue-700/80 dark:text-blue-300/80">
                            Siga os passos para receber seus primeiros leads.
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{Math.round(progress)}%</span>
                    </div>
                </div>
                <Progress value={progress} className="h-2 mt-2 bg-blue-200 dark:bg-blue-900" indicatorClassName="bg-blue-600 dark:bg-blue-400" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className={cn(
                            "flex items-start gap-3 p-3 rounded-lg transition-colors",
                            step.completed ? "bg-white/50 dark:bg-black/20" : "bg-white dark:bg-card border shadow-sm"
                        )}>
                            <div className="mt-1">
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={cn("font-medium text-sm", step.completed && "text-muted-foreground line-through decoration-transparent")}>
                                    {step.label}
                                </h4>
                                {!step.completed && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                            {step.action && (
                                <div className="shrink-0">
                                    {step.action}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
