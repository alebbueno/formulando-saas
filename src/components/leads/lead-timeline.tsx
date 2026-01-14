"use client"

import { LeadEvent } from "@/actions/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { ptBR } from "date-fns/locale/pt-BR"
import { CheckCircle2, FileText, MousePointerClick } from "lucide-react"

interface LeadTimelineProps {
    events: LeadEvent[]
}

function getEventIcon(type: string) {
    switch (type) {
        case 'form_submit':
            return <FileText className="h-4 w-4 text-blue-500" />
        case 'page_view':
            return <MousePointerClick className="h-4 w-4 text-gray-500" />
        case 'status_change':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />
        default:
            return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
    }
}

function getEventTitle(event: LeadEvent) {
    switch (event.type) {
        case 'form_submit':
            return "Enviou um formulário"
        case 'page_view':
            return "Visualizou uma página"
        case 'status_change':
            return "Mudança de status"
        default:
            return "Evento registrado"
    }
}

export function LeadTimeline({ events }: LeadTimelineProps) {
    if (events.length === 0) {
        return (
            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader>
                    <CardTitle>Linha do Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <FileText className="h-10 w-10 opacity-20 mb-3" />
                        <p className="text-sm">Nenhum evento registrado para este lead.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Atividades Recentes</CardTitle>
                    <div className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {events.length} Eventos
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-muted/50 ml-3 space-y-10 pb-4">
                    {events.map((event) => (
                        <div key={event.id} className="ml-8 relative group">
                            {/* Dot */}
                            <span className="absolute -left-[41px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-muted text-muted-foreground shadow-sm transition-colors group-hover:border-primary/20 group-hover:text-primary">
                                {getEventIcon(event.type)}
                            </span>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <h4 className="text-sm font-bold text-foreground">{getEventTitle(event)}</h4>
                                    <time className="text-xs text-muted-foreground font-medium">
                                        {formatDistanceToNow(new Date(event.created_at), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </time>
                                </div>

                                {event.type === 'form_submit' && (
                                    <div className="mt-2 rounded-xl border bg-card shadow-sm overflow-hidden">
                                        <div className="bg-muted/30 px-4 py-2 border-b text-xs font-medium text-muted-foreground">
                                            Dados do Formulário
                                        </div>
                                        <div className="p-4 grid gap-y-4">
                                            {Object.entries(event.payload.data || {}).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-3 gap-4 text-sm">
                                                    <span className="text-muted-foreground font-medium truncate col-span-1 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="col-span-2 break-words text-foreground/90">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {event.type === 'status_change' && (
                                    <p className="text-sm text-foreground/80">
                                        Alterou o status para <span className="font-semibold text-primary">{event.payload.new_status}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
