import { getEmailTemplates } from "@/actions/emails"
import { EmailTemplatesTable } from "@/components/emails/email-templates-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { UsageLimitCard } from "@/components/dashboard/usage-limit-card"
import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getWorkspaceUsage } from "@/actions/usage"

export default async function EmailsPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}
    const usageData = activeWorkspace ? await getWorkspaceUsage(activeWorkspace.id) : null

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const templates = await getEmailTemplates(activeWorkspace.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">Templates de Email</h2>
                    <p className="text-muted-foreground">
                        Crie e gerencie templates de email com personalização
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {usageData && usageData.plan.slug === 'free' && (
                        <div className="flex items-center gap-3">
                            <div className="min-w-[200px]">
                                <UsageLimitCard
                                    current={usageData.usage.emailTemplates}
                                    limit={usageData.usage.emailTemplatesLimit}
                                    label="Templates"
                                    unit="unid"
                                    planSlug={usageData.plan.slug}
                                />
                            </div>
                            <div className="min-w-[200px]">
                                <UsageLimitCard
                                    current={usageData.usage.emailsSent}
                                    limit={usageData.usage.emailsSentLimit}
                                    label="Envios"
                                    unit="/mês"
                                    planSlug={usageData.plan.slug}
                                />
                            </div>
                        </div>
                    )}
                    <Button asChild>
                        <Link href="/dashboard/emails/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Template
                        </Link>
                    </Button>
                </div>
            </div>

            <EmailTemplatesTable templates={templates} />
        </div>
    )
}
