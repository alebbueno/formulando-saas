import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getEmailLogs } from "@/actions/email-logs"
import { HistoryClientWrapper } from "./history-client-wrapper"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Mail } from "lucide-react"
import Link from "next/link"

export default async function EmailHistoryPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const initialData = await getEmailLogs(activeWorkspace.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/emails">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Mail className="h-8 w-8 text-primary" />
                            Histórico de Envios
                        </h2>
                        <p className="text-muted-foreground">
                            Acompanhe todos os e-mails disparados pelo sistema.
                        </p>
                    </div>
                </div>
            </div>

            <HistoryClientWrapper 
                workspaceId={activeWorkspace.id} 
                initialData={{
                    logs: initialData.success ? initialData.logs || [] : [],
                    count: initialData.count || 0,
                    totalPages: initialData.totalPages || 0
                }}
            />
        </div>
    )
}
