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

    let projects: any[] = []

    if (activeWorkspaceId) {
        const { data } = await supabase
            .from("projects")
            .select("*, form_submissions(count)")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: false })

        if (data) projects = data.map(p => ({
            ...p,
            leads: p.form_submissions // Map for consistency if needed by Overview/ProjectList
        }))
    }

    const projectsCount = projects.length
    // type check for leads count
    const leadsCount = projects.reduce((acc, project) => {
        // @ts-ignore
        return acc + (project.leads?.[0]?.count || 0)
    }, 0)

    return (
        <div className="space-y-6">


            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <form action={createProject}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Formulário
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Formulários
                        </CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            +0% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Leads Capturados
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leadsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            +0% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Taxa de Conversão
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">
                            +0% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ativos Agora
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0 desde a última hora
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Geral de Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Formulários Recentes</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/forms">
                                Ver todos
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {projectsCount === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-8">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Nenhum formulário criado ainda.
                                </p>
                            </div>
                        ) : (
                            <ProjectList
                                projects={projects.slice(0, 5)}
                                initialViewMode="list"
                                hideViewToggle={true}
                                hideHeader={true}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
