"use client"

import { useOnboarding } from "@/context/onboarding-context"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/events"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { Label } from "@/components/ui/label"

export default function OnboardingNamePage() {
    const { state, setWorkspaceName } = useOnboarding()
    const [name, setName] = useState(state.workspaceName || "")
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setWorkspaceName(name)
        trackEvent("workspace_name_filled", { name_length: name.length })
        router.push("/onboarding/workspace/goal")
    }

    return (
        <div className="flex flex-col items-center max-w-lg mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Qual o nome do projeto ou cliente?
                </h1>
                <p className="text-muted-foreground">
                    Você pode alterar isso depois nas configurações.
                </p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="w-full space-y-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="workspaceName" className="sr-only">Nome do Workspace</Label>
                    <Input
                        id="workspaceName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Agência XPTO ou Cliente ABC"
                        className="text-lg py-6"
                        autoFocus
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg h-12"
                    disabled={!name.trim()}
                >
                    Continuar <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </motion.form>
        </div>
    )
}
