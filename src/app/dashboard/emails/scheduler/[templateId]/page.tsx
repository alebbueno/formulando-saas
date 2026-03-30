import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getTemplateStats, getTemplateLogs } from "@/actions/email-logs"
import { AutomationDetailView } from "@/components/emails/automation-detail-view"
import { createClient } from "@/lib/supabase/server"

export default async function AutomationDetailPage({
    params
}: {
    params: Promise<{ templateId: string }>
}) {
    const resolvedParams = await params
    const { templateId } = resolvedParams
    const workspaceData = await getActiveWorkspace()
    const activeWorkspace = workspaceData?.activeWorkspace

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const supabase = await createClient()
    let templateName = "Envio Direto"

    if (templateId !== "direct") {
        const { data: template } = await supabase
            .from("email_templates")
            .select("name")
            .eq("id", templateId)
            .single()

        if (!template) {
            // Se não achar o template, mas houver logs, não damos 404
            // Apenas usamos um nome genérico
            templateName = "Template Removido"
        } else {
            templateName = template.name
        }
    }

    const [stats, logs] = await Promise.all([
        getTemplateStats(templateId, activeWorkspace.id),
        getTemplateLogs(templateId, activeWorkspace.id)
    ])

    return (
        <AutomationDetailView 
            templateId={templateId}
            workspaceId={activeWorkspace.id}
            templateName={templateName}
            initialStats={stats}
            initialLogs={logs}
        />
    )
}
