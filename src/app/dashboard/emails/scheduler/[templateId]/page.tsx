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
    const workspace = await getActiveWorkspace()
    const { templateId } = params

    if (!workspace) return null

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
        getTemplateStats(templateId, workspace.id),
        getTemplateLogs(templateId, workspace.id)
    ])

    return (
        <AutomationDetailView 
            templateId={templateId}
            workspaceId={workspace.id}
            templateName={template.name}
            initialStats={stats}
            initialLogs={logs}
        />
    )
}
