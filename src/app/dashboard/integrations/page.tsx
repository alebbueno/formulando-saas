import { IntegrationsList } from "@/components/integrations/integrations-list"
import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { checkLimit } from "@/lib/limits"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock } from "lucide-react"

export default async function IntegrationsPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace?.id) {
        return <div>Selecione um workspace</div>
    }

    const limitCheck = await checkLimit(activeWorkspace.id as string, "integrations")

    if (!limitCheck.allowed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 animate-in fade-in duration-500">
                <div className="p-4 bg-primary/5 rounded-full">
                    <Lock className="w-12 h-12 text-primary/60" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-bold">Plano Free Limitado</h3>
                    <p className="text-muted-foreground">
                        Integrações com ferramentas externas (Google Sheets, Zapier, Webhooks) não estão disponíveis neste plano. Faça o upgrade para automatizar seus leads!
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

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Integrações
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl font-light">
                        Supercharge seus formulários conectando-os às suas ferramentas favoritas.
                    </p>
                </div>
            </div>

            <div className="h-full py-6">
                <IntegrationsList />
            </div>
        </div>
    )
}

