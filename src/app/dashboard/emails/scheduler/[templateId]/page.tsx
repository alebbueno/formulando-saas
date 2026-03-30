import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getTemplateStats, getTemplateLogs } from "@/actions/email-logs"
import { AutomationDetailView } from "@/components/emails/automation-detail-view"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function AutomationDetailPage({
    params
}: {
    params: { templateId: string }
}) {
    const workspaceData = await getActiveWorkspace()
    const activeWorkspace = workspaceData?.activeWorkspace
    const { templateId } = params

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const supabase = await createClient()
    const { data: template } = await supabase
        .from("email_templates")
        .select("name")
        .eq("id", templateId)
        .single()

    if (!template) {
        notFound()
    }

    const [stats, logs] = await Promise.all([
        getTemplateStats(templateId, activeWorkspace.id),
        getTemplateLogs(templateId, activeWorkspace.id)
    ])

    return (
        <AutomationDetailView 
            templateId={templateId}
            workspaceId={activeWorkspace.id}
            templateName={template.name}
            initialStats={stats}
            initialLogs={logs}
        />
    )
}
