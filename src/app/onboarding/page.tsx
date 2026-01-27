"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/events"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function OnboardingWelcomePage() {
    const router = useRouter()

    useEffect(() => {
        trackEvent("onboarding_started")
        trackEvent("post_signup_screen_viewed")
    }, [])

    const handleStart = () => {
        router.push("/onboarding/workspace/usage")
    }

    return (
        <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Vamos configurar seu primeiro projeto
                </h1>
                <p className="text-xl text-muted-foreground">
                    Antes de tudo, vamos criar um workspace para você ver o Formulando funcionando na prática.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90"
                    onClick={handleStart}
                >
                    Criar meu primeiro workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </motion.div>
        </div>
    )
}
