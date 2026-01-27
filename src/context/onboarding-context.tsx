"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type UsageType = "agency" | "business" | "learning" | null
export type GoalType = "capture_leads" | "qualify_opportunities" | "organize_funnel" | null

interface OnboardingState {
    usageType: UsageType
    workspaceName: string
    goal: GoalType
}

interface OnboardingContextType {
    state: OnboardingState
    setUsageType: (type: UsageType) => void
    setWorkspaceName: (name: string) => void
    setGoal: (goal: GoalType) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>({
        usageType: null,
        workspaceName: "",
        goal: null,
    })

    const setUsageType = (usageType: UsageType) => setState((prev) => ({ ...prev, usageType }))
    const setWorkspaceName = (workspaceName: string) => setState((prev) => ({ ...prev, workspaceName }))
    const setGoal = (goal: GoalType) => setState((prev) => ({ ...prev, goal }))

    return (
        <OnboardingContext.Provider value={{ state, setUsageType, setWorkspaceName, setGoal }}>
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (context === undefined) {
        throw new Error("useOnboarding must be used within a OnboardingProvider")
    }
    return context
}
