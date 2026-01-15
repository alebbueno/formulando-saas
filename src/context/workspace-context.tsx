"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { setActiveWorkspaceCookie } from "@/app/dashboard/actions"
import { Loader2 } from "lucide-react"

export type Workspace = {
    id: string
    name: string
    slug: string
    role: "owner" | "member" | "client" | "finance_client"
    kanban_columns?: any[]
    subscription_status?: string
    plan?: {
        slug: string
        name: string
        max_leads_per_month: number
        max_emails_per_month: number
    }
}

type WorkspaceContextType = {
    workspaces: Workspace[]
    activeWorkspace: Workspace | null
    isLoading: boolean
    switchWorkspace: (workspaceId: string) => void
    refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSwitching, setIsSwitching] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const fetchWorkspaces = async () => {
        try {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Join workspaces via workspace_members
            const { data: members, error } = await supabase
                .from("workspace_members")
                .select(`
                    role,
                    workspace:workspaces (
                        id,
                        name,
                        slug,
                        kanban_columns,
                        subscription_status,
                        plan:plans(slug, name, max_leads_per_month, max_emails_per_month)
                    )
                `)
                .eq("user_id", user.id)

            if (error) {
                console.error("Error fetching workspaces:", error)
                return
            }

            const formattedWorkspaces = members.map((member: any) => ({
                id: member.workspace.id,
                name: member.workspace.name,
                slug: member.workspace.slug,
                role: member.role,
                kanban_columns: member.workspace.kanban_columns,
                subscription_status: member.workspace.subscription_status,
                plan: member.workspace.plan,
            }))

            setWorkspaces(formattedWorkspaces)

            // Restore active workspace from localStorage or pick first
            const storedWorkspaceId = localStorage.getItem("activeWorkspaceId")
            const foundStoredString = formattedWorkspaces.find(w => w.id === storedWorkspaceId)

            if (foundStoredString) {
                setActiveWorkspace(foundStoredString)
                // Ensure cookie is in sync
                if (storedWorkspaceId) setActiveWorkspaceCookie(storedWorkspaceId)
            } else if (formattedWorkspaces.length > 0) {
                setActiveWorkspace(formattedWorkspaces[0])
                localStorage.setItem("activeWorkspaceId", formattedWorkspaces[0].id)
                setActiveWorkspaceCookie(formattedWorkspaces[0].id)
            }
        } catch (err) {
            console.error("Error in fetchWorkspaces:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    const switchWorkspace = async (workspaceId: string) => {
        const workspace = workspaces.find((w) => w.id === workspaceId)
        if (workspace) {
            setIsSwitching(true)
            setActiveWorkspace(workspace)
            localStorage.setItem("activeWorkspaceId", workspace.id)
            await setActiveWorkspaceCookie(workspace.id)
            // Force a hard reload and navigation to root dashboard
            window.location.href = "/dashboard"
        }
    }

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                isLoading,
                switchWorkspace,
                refreshWorkspaces: fetchWorkspaces,
            }}
        >
            {isSwitching && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Trocando workspace...</p>
                    </div>
                </div>
            )}
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider")
    }
    return context
}
