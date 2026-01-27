"use client"

import { useOnboarding, GoalType } from "@/context/onboarding-context"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/events"
import { Target, Users, BarChart3, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { createOnboardingWorkspace } from "../../actions"
import { toast } from "sonner"

const goalOptions: { id: GoalType, icon: any, title: string }[] = [
    {
        id: "capture_leads",
        icon: Users,
        title: "Captar leads",
    },
    {
        id: "qualify_opportunities",
        icon: Target,
        title: "Qualificar oportunidades",
    },
    {
        id: "organize_funnel",
        icon: BarChart3,
        title: "Organizar funil de vendas",
    },
]

export default function OnboardingGoalPage() {
    const { state, setGoal } = useOnboarding()
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)

    const handleSelect = async (goal: GoalType) => {
        if (isCreating) return

        setGoal(goal)
        trackEvent("workspace_goal_selected", { goal })

        setIsCreating(true)

        try {
            const result = await createOnboardingWorkspace({
                name: state.workspaceName || "Meu Workspace",
                usage: state.usageType,
                goal: goal
            })

            if (result.error) {
                toast.error(result.error)
                setIsCreating(false)
                return
            }

            trackEvent("workspace_created")
            // Add a small delay for UX so user sees selection state? 
            // Actually let's just go.
            router.push("/onboarding/start")
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao criar o workspace.")
            setIsCreating(false)
        }
    }

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Qual seu principal objetivo agora?
                </h1>
                <p className="text-muted-foreground">
                    Vamos configurar o dashboard ideal para você.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                {goalOptions.map((option, index) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelect(option.id)}
                        disabled={isCreating}
                        className={cn(
                            "flex items-center p-6 text-left",
                            "bg-card hover:bg-accent/50 border rounded-xl transition-all duration-200",
                            "hover:scale-[1.02] hover:shadow-md hover:border-primary/50",
                            "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            isCreating && "opacity-50 cursor-not-allowed hover:scale-100"
                        )}
                    >
                        <div className="p-3 rounded-full bg-primary/10 text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            {isCreating && state.goal === option.id ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <option.icon className="w-6 h-6" />
                            )}
                        </div>
                        <span className="font-semibold text-lg">{option.title}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
