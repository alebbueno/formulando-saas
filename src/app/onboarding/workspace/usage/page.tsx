"use client"

import { useOnboarding, UsageType } from "@/context/onboarding-context"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/events"
import { Building2, User, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const usageOptions: { id: UsageType, icon: any, title: string, description: string }[] = [
    {
        id: "agency",
        icon: Building2,
        title: "Agência",
        description: "Vou criar projetos para meus clientes",
    },
    {
        id: "business",
        icon: User,
        title: "Meu próprio negócio",
        description: "Vou criar formulários para minha empresa",
    },
    {
        id: "learning",
        icon: GraduationCap,
        title: "Estudos / Testes",
        description: "Estou aprendendo ou testando a plataforma",
    },
]

export default function OnboardingUsagePage() {
    const { setUsageType } = useOnboarding()
    const router = useRouter()

    const handleSelect = (type: UsageType) => {
        setUsageType(type)
        trackEvent("workspace_usage_selected", { usage: type })
        router.push("/onboarding/workspace/name")
    }

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Para quem você vai usar o Formulando?
                </h1>
                <p className="text-muted-foreground">
                    Isso nos ajuda a personalizar sua experiência.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {usageOptions.map((option, index) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelect(option.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-6 h-auto text-center",
                            "bg-card hover:bg-accent/50 border rounded-xl transition-all duration-200",
                            "hover:scale-105 hover:shadow-lg hover:border-primary/50",
                            "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                    >
                        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <option.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
