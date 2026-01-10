import { IntegrationsList } from "@/components/integrations/integrations-list"

export default function IntegrationsPage() {
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
