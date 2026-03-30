"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Play, 
    Loader2, 
    Calendar,
    Mail,
    RefreshCw,
    Activity,
    Layers,
    ChevronRight
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { deleteScheduledLog, processScheduledLogNow, getScheduledQueueIds } from "@/actions/email-logs"
import { cn } from "@/lib/utils"

interface SchedulerViewProps {
    workspaceId: string
    initialMetrics: {
        scheduled: number
        pending: number
        sent24h: number
        failed24h: number
    }
    initialQueue: any[]
}

export function SchedulerView({ workspaceId, initialMetrics, initialQueue }: SchedulerViewProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [processingIds, setProcessingIds] = useState<string[]>([])
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)
    const [processedCount, setProcessedCount] = useState(0)
    const [totalToProcess, setTotalToProcess] = useState(0)

    // Grouping Logic
    const groupedQueue = useMemo(() => {
        const groups: Record<string, { name: string, items: any[] }> = {}
        
        initialQueue.forEach(item => {
            const templateName = item.email_template?.name || "Envio Direto / Sem Template"
            const templateId = item.template_id || "direct"
            
            if (!groups[templateId]) {
                groups[templateId] = { name: templateName, items: [] }
            }
            groups[templateId].items.push(item)
        })
        
        return Object.entries(groups).sort((a, b) => b[1].items.length - a[1].items.length)
    }, [initialQueue])

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return

        startTransition(async () => {
            const result = await deleteScheduledLog(id)
            if (result.success) {
                toast.success("Agendamento cancelado com sucesso")
                router.refresh()
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleProcessNow = async (id: string) => {
        setProcessingIds(prev => [...prev, id])
        const result = await processScheduledLogNow(id)
        setProcessingIds(prev => prev.filter(item => item !== id))

        if (result.success) {
            toast.success("E-mail processado com sucesso")
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    const handleProcessAll = async () => {
        if (!confirm("Isso irá processar todos os emails agendados sequencialmente. Pode levar alguns minutos. Deseja continuar?")) return
        
        setIsBulkProcessing(true)
        setProcessedCount(0)
        
        try {
            const allIds = await getScheduledQueueIds(workspaceId)
            setTotalToProcess(allIds.length)
            
            if (allIds.length === 0) {
                toast.info("Nenhum email na fila para processar")
                setIsBulkProcessing(false)
                return
            }

            const batchSize = 3
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize)
                await Promise.all(batch.map(async (id) => {
                    await processScheduledLogNow(id)
                    setProcessedCount(prev => prev + 1)
                }))
                
                if (i + batchSize < allIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
            
            toast.success("Todos os emails foram processados com sucesso!")
        } catch (error) {
            console.error("Bulk process error:", error)
            toast.error("Ocorreu um erro durante o processamento em massa")
        } finally {
            setIsBulkProcessing(false)
            router.refresh()
        }
    }

    const handleProcessGroup = async (items: any[], groupName: string) => {
        if (!confirm(`Deseja processar todos os ${items.length} emails da automação "${groupName}"?`)) return
        
        setIsBulkProcessing(true)
        setProcessedCount(0)
        setTotalToProcess(items.length)
        
        try {
            const batchSize = 3
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize)
                await Promise.all(batch.map(async (item) => {
                    await processScheduledLogNow(item.id)
                    setProcessedCount(prev => prev + 1)
                }))
                
                if (i + batchSize < items.length) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
            toast.success(`Grupo "${groupName}" processado com sucesso!`)
        } catch (error) {
            toast.error("Erro ao processar grupo")
        } finally {
            setIsBulkProcessing(false)
            router.refresh()
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/10 bg-primary/5 shadow-sm shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aguardando Envio</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.scheduled + initialMetrics.pending}</div>
                        <p className="text-[10px] uppercase font-semibold text-primary/70 mt-1">
                            Prontos para processamento
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/10 bg-emerald-500/5 shadow-sm shadow-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enviados (24h)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.sent24h}</div>
                        <p className="text-[10px] uppercase font-semibold text-emerald-600/70 mt-1">
                            Volume de entregas hoje
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-rose-500/10 bg-rose-500/5 shadow-sm shadow-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Falhas (24h)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.failed24h}</div>
                        <p className="text-[10px] uppercase font-semibold text-rose-600/70 mt-1">
                            Erros detectados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/10 bg-orange-500/5 shadow-sm shadow-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado do Cron</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-black uppercase text-orange-600 flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Ativo (Daily)
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                            Plano Hobby: Execução Diária
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Queue Table Grouped */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Fila Agrupada por Automação
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Visualize os agendamentos organizados por template de origem.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isBulkProcessing ? (
                            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full text-xs font-bold text-primary border border-primary/20 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processando: {processedCount} / {totalToProcess}
                            </div>
                        ) : (
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="h-10 gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                onClick={handleProcessAll}
                                disabled={initialQueue.length === 0}
                            >
                                <Play className="h-3 w-3 fill-current" />
                                Processar Toda a Fila
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 w-10 p-0"
                            onClick={() => {
                                router.refresh()
                                toast.info("Atualizando fila...")
                            }}
                            disabled={isBulkProcessing}
                        >
                            <RefreshCw className={cn("h-4 w-4", (isPending || isBulkProcessing) && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {groupedQueue.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-20 border-dashed bg-muted/10">
                        <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h4 className="text-xl font-semibold text-muted-foreground/50">Fila vazia</h4>
                        <p className="text-sm text-muted-foreground/40">Não há e-mails aguardando envio neste momento.</p>
                    </Card>
                ) : (
                    <Accordion type="multiple" className="space-y-3" defaultValue={[groupedQueue[0]?.[0]]}>
                        {groupedQueue.map(([id, group]) => (
                            <AccordionItem key={id} value={id} className="border bg-card rounded-xl px-4 first:mt-0 overflow-hidden shadow-sm hover:shadow-md transition-all border-primary/5">
                                <div className="flex items-center justify-between">
                                    <AccordionTrigger className="hover:no-underline flex-1 py-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Mail className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm lg:text-base leading-none mb-1">{group.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-[10px] h-4 bg-muted/50 text-muted-foreground border-none">
                                                        {group.items.length} {group.items.length === 1 ? 'e-mail' : 'e-mails'}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Pendente
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex items-center gap-3 pr-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 gap-2 border-primary/20 text-primary hover:bg-primary/5 font-semibold text-xs rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleProcessGroup(group.items, group.name)
                                            }}
                                            disabled={isBulkProcessing}
                                        >
                                            <Play className="h-3 w-3 fill-current" />
                                            Enviar Grupo
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent className="pb-4 pt-2 border-t border-dashed">
                                    <div className="rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="py-2 h-auto text-[10px] uppercase font-bold text-muted-foreground/70">Lead / Destinatário</TableHead>
                                                    <TableHead className="py-2 h-auto text-[10px] uppercase font-bold text-muted-foreground/70 text-center">Agendado Para</TableHead>
                                                    <TableHead className="py-2 h-auto text-[10px] uppercase font-bold text-muted-foreground/70 text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.items.map((item) => (
                                                    <TableRow key={item.id} className="group/row hover:bg-muted/10 border-transparent">
                                                        <TableCell className="py-2">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm text-foreground/90">{item.lead?.name || "Sem Nome"}</span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">{item.lead?.email}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs font-mono font-bold text-muted-foreground/80">{format(new Date(item.scheduled_for), "HH:mm")}</span>
                                                                <span className="text-[9px] text-muted-foreground/60 uppercase">
                                                                    {formatDistanceToNow(new Date(item.scheduled_for), { addSuffix: true, locale: ptBR })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    onClick={() => handleProcessNow(item.id)}
                                                                    disabled={processingIds.includes(item.id) || isBulkProcessing}
                                                                    title="Enviar Agora"
                                                                >
                                                                    {processingIds.includes(item.id) ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Play className="h-3 w-3 fill-current" />
                                                                    )}
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                                    onClick={() => handleDelete(item.id)}
                                                                    disabled={isPending || isBulkProcessing}
                                                                    title="Cancelar"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    )
}
