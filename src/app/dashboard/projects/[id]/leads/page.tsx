import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLeads } from "@/actions/leads"
import { ProjectLeadsClient } from "./client"

export default async function ProjectLeadsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Usuário não autenticado</div>
    }

    // Fetch project details to verify ownership
    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("workspace_id", (
            await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single()
        ).data?.id) // Simplified check
        .single()

    if (!project) {
        return notFound()
    }

    // Fetch initial leads using the server action
    const { leads, total } = await getLeads({
        projectId: id,
        page: 1,
        pageSize: 10,
        orderBy: 'created_at',
        orderDirection: 'desc'
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Leads: {project.name}</h2>
                        <p className="text-muted-foreground">
                            {total} leads capturados no total
                        </p>
                    </div>
                </div>
            </div>

            <ProjectLeadsClient
                initialLeads={leads}
                projectId={id}
                initialTotal={total}
            />
        </div>
    )
}
