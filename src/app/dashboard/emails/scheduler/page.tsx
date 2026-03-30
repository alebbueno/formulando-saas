import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getSchedulerMetrics, getScheduledQueue } from "@/actions/email-logs"
import { SchedulerView } from "@/components/emails/scheduler-view"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CalendarClock } from "lucide-react"
import Link from "next/link"

export default async function SchedulerPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const [metrics, queue] = await Promise.all([
        getSchedulerMetrics(activeWorkspace.id),
        getScheduledQueue(activeWorkspace.id)
    ])

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
                            <CalendarClock className="h-8 w-8 text-primary" />
                            Agendador de Emails
                        </h2>
                        <p className="text-muted-foreground">
                            Monitore a fila de envios automáticos e o estado do sistema.
                        </p>
                    </div>
                </div>
            </div>

            <SchedulerView 
                workspaceId={activeWorkspace.id}
                initialMetrics={metrics}
                initialQueue={queue}
            />
        </div>
    )
}
