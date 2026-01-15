import { getWhatsAppConfig } from "@/actions/whatsapp"
import { getActiveWorkspace } from "@/lib/get-active-workspace"

import { ClientPageWrapper } from "@/components/whatsapp"

// Server Component for WhatsApp Dashboard Page

export default async function WhatsappPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const config = await getWhatsAppConfig(activeWorkspace.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">WhatsApp Widget</h2>
                <div className="text-sm text-muted-foreground">
                    Capture leads diretamente pelo WhatsApp
                </div>
            </div>

            <ClientPageWrapper
                config={config}
                workspaceId={activeWorkspace.id}
            />
        </div>
    )
}
