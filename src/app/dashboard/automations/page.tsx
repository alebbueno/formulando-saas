import { createClient } from "@/lib/supabase/server"
import { AutomationsList } from "../../../components/automations/automations-list"
import { CreateAutomationButton } from "../../../components/automations/create-automation-button"

import { getActiveWorkspace } from "@/lib/get-active-workspace"

export default async function AutomationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth required</div>

    const { activeWorkspace } = await getActiveWorkspace() || {}

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
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Automações</h2>
                    <p className="text-muted-foreground">Crie fluxos visuais para automatizar suas tarefas.</p>
                </div>
                <CreateAutomationButton />
            </div>

            <AutomationsList workspaceId={activeWorkspace.id} />
        </div>
    )
}
