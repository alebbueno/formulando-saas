import { createClient } from "@/lib/supabase/server"
import { AutomationsList } from "../../../components/automations/automations-list"
import { CreateAutomationButton } from "../../../components/automations/create-automation-button"

import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getWorkspaceUsage } from "@/actions/usage"
import { UsageLimitCard } from "@/components/dashboard/usage-limit-card"

export default async function AutomationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth required</div>

    const { activeWorkspace } = await getActiveWorkspace() || {}
    const usageData = activeWorkspace ? await getWorkspaceUsage(activeWorkspace.id) : null

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <h3 className="text-lg font-semibold">Nenhum workspace encontrado</h3>
                <p>Crie um workspace para começar.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">Automações</h2>
                    <p className="text-muted-foreground">Crie fluxos visuais para automatizar suas tarefas.</p>
                </div>
                <div className="flex items-center gap-4">
                    {usageData && usageData.plan.slug === 'free' && (
                        <div className="min-w-[300px]">
                            <UsageLimitCard
                                current={usageData.usage.automations}
                                limit={usageData.usage.automationsLimit}
                                label="Automações"
                                unit="unid"
                                planSlug={usageData.plan.slug}
                            />
                        </div>
                    )}
                    <CreateAutomationButton />
                </div>
            </div>

            <AutomationsList workspaceId={activeWorkspace.id} />
        </div>
    )
}
