import Link from "next/link"
import { redirect } from "next/navigation"
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
import { DashboardChecklist } from "@/components/dashboard/dashboard-checklist"

import { cookies } from "next/headers"

// ...

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Usuário não autenticado</div>
    }

    const { getActiveWorkspace } = await import("@/lib/get-active-workspace")
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const { getLeadStats } = await import("@/actions/leads")
    const leadStats = await getLeadStats(activeWorkspace.id)

    // Fetch projects to determine checklist status
    const { data: projects } = await supabase
        .from("projects")
        .select("id, is_published")
        .eq("workspace_id", activeWorkspace.id)

    const hasProjects = (projects?.length ?? 0) > 0
    const hasPublishedProjects = projects?.some(p => p.is_published) ?? false
    const hasLeads = leadStats.total > 0

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

            <DashboardChecklist
                hasProjects={hasProjects}
                hasPublishedProjects={hasPublishedProjects}
                hasLeads={hasLeads}
            />

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
