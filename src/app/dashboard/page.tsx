import Link from "next/link"
import { Plus, Folder, Users } from "lucide-react"
import { createProject } from "./actions"
import { createClient } from "@/lib/supabase/server"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ProjectList } from "@/components/dashboard/project-list"
import { Overview } from "@/components/dashboard/overview"
import { MarketingOverview } from "@/components/dashboard/marketing-overview"

import { cookies } from "next/headers"

// ...

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Usuário não autenticado</div>
    }

    const cookieStore = await cookies()
    const workspaceId = cookieStore.get("formu-workspace-id")?.value

    let activeWorkspaceId = workspaceId

    // Validate if user has access to this workspace or pick default
    // Validate if user has access to this workspace or pick default

    // 1. Fetch Owned Workspaces
    const { data: ownedWorkspaces } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("owner_id", user.id)

    // 2. Fetch Member Workspaces
    const { data: memberWorkspaces } = await supabase
        .from("workspace_members")
        .select("workspace:workspaces(id, name)")
        .eq("user_id", user.id)

    // 3. Combine
    const workspaces = [
        ...(ownedWorkspaces || []),
        ...(memberWorkspaces?.map((m: any) => m.workspace).filter(Boolean) || [])
    ]

    // Deduplicate just in case (though owner shouldn't be member usually, but safe to check)
    const uniqueWorkspacesMap = new Map()
    workspaces.forEach(w => uniqueWorkspacesMap.set(w.id, w))
    const allWorkspaces = Array.from(uniqueWorkspacesMap.values())

    // If no workspaceId in cookie, or invalid, pick the first one
    if (!activeWorkspaceId && workspaces && workspaces.length > 0) {
        activeWorkspaceId = workspaces[0].id
    }

    // Verify if workspaceId exists in user's workspaces (if cookie was stale/manipulated)
    if (activeWorkspaceId && workspaces) {
        const hasAccess = workspaces.some(w => w.id === activeWorkspaceId)
        if (!hasAccess && workspaces.length > 0) {
            activeWorkspaceId = workspaces[0].id
        }
    }

    const { getLeadStats } = await import("@/actions/leads")
    const leadStats = await getLeadStats()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
                    <p className="text-muted-foreground">Visão geral da sua máquina de vendas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <form action={createProject}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Formulário
                        </Button>
                    </form>
                </div>
            </div>

            <MarketingOverview stats={leadStats} />

            {/* Recent Forms / Projects Section */}
            <div className="grid gap-4">
                {/* Reuse existing Project List logic if desired, or keep it separate. 
                     For MVP Dashboard as "Marketing Dashboard", let's keep projects accessible.
                 */}
            </div>
        </div>
    )
}
