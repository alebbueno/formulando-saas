import { getWhatsAppConfig } from "@/actions/whatsapp"
import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { checkLimit } from "@/lib/limits"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock } from "lucide-react"

import { ClientPageWrapper } from "@/components/whatsapp"

// Server Component for WhatsApp Dashboard Page

export default async function WhatsappPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const limitCheck = await checkLimit(activeWorkspace.id, "whatsapp")

    if (!limitCheck.allowed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 animate-in fade-in duration-500">
                <div className="p-4 bg-primary/5 rounded-full">
                    <Lock className="w-12 h-12 text-primary/60" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-bold">Plano Free Limitado</h3>
                    <p className="text-muted-foreground">
                        O botão de WhatsApp e widgets de captura avançada são recursos exclusivos de planos premium. Faça o upgrade para liberar agora!
                    </p>
                </div>
                <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Link href="/dashboard/plans">
                        Fazer Upgrade Agora
                    </Link>
                </Button>
            </div>
        )
    }

    const config = await getWhatsAppConfig(activeWorkspace.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">WhatsApp Widget</h2>
                <div className="text-sm text-muted-foreground">
                    Capture leads e direcione para o WhatsApp
                </div>
            </div>

            <ClientPageWrapper
                config={config}
                workspaceId={activeWorkspace.id}
            />
        </div>
    )
}
