"use client"

import { useState, useTransition } from "react"
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
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Play, 
    Loader2, 
    Calendar,
    Mail,
    RefreshCw,
    Activity
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

            // Process in small batches of 3 to avoid overwhelming
            const batchSize = 3
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize)
                await Promise.all(batch.map(async (id) => {
                    await processScheduledLogNow(id)
                    setProcessedCount(prev => prev + 1)
                }))
                
                // Optional: small delay between batches
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

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/10 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando Envio</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialMetrics.scheduled + initialMetrics.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-primary/80">
                            Prontos para processamento
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/10 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enviados (24h)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialMetrics.sent24h}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600/80">
                            Volume de entregas recente
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-rose-500/10 bg-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Falhas (24h)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialMetrics.failed24h}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-rose-600/80">
                            Erros detectados hoje
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/10 bg-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado do Cron</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold uppercase text-orange-600">Ativo</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ciclo: Cada 10 minutos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Config Info */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                        Configurações do Agendador
                    </CardTitle>
                    <CardDescription>
                        Entenda como o formulando processa seus envios automáticos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-muted-foreground">
                    <p>• O sistema verifica a fila a cada <span className="font-bold text-foreground">10 minutos</span>.</p>
                    <p>• Em cada ciclo, são processados até <span className="font-bold text-foreground">100 e-mails</span> pendentes.</p>
                    <p>• O horário de referência do servidor é <span className="font-bold text-foreground">UTC</span>.</p>
                </CardContent>
            </Card>

            {/* Queue Table */}
            <Card className="rounded-xl overflow-hidden border-none shadow-sm shadow-primary/10">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Fila Próximos Envios
                            </CardTitle>
                            <CardDescription>
                                E-mails agendados aguardando o próximo ciclo de cron.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {isBulkProcessing ? (
                                <div className="flex items-center gap-3 bg-primary/10 px-3 py-1 rounded-md text-xs font-medium text-primary border border-primary/20">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Processando: {processedCount} / {totalToProcess}
                                </div>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 gap-2 text-primary border-primary/20 hover:bg-primary/10"
                                    onClick={handleProcessAll}
                                    disabled={initialQueue.length === 0}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Processar Tudo
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9"
                                onClick={() => {
                                    router.refresh()
                                    toast.info("Atualizando fila...")
                                }}
                                disabled={isBulkProcessing}
                            >
                                <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
                                Atualizar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/40 font-bold">
                        <TableRow>
                            <TableHead>Lead</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Agendado Para</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialQueue.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Mail className="h-8 w-8 opacity-20" />
                                        <p>Nenhum envio agendado no momento.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialQueue.map((item) => (
                                <TableRow key={item.id} className="group hover:bg-muted/20">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.lead?.name || "Sem Nome"}</span>
                                            <span className="text-xs text-muted-foreground">{item.lead?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-2 py-0">
                                            {item.email_template?.name || "Email Direto"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-mono text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(item.scheduled_for), "dd/MM/yyyy HH:mm")}</span>
                                            <span className="text-[10px]">
                                                {formatDistanceToNow(new Date(item.scheduled_for), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary"
                                            className={cn(
                                                "capitalize",
                                                item.status === 'scheduled' ? "bg-amber-100 text-amber-700 font-bold" : "bg-blue-100 text-blue-700"
                                            )}
                                        >
                                            {item.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                onClick={() => handleProcessNow(item.id)}
                                                disabled={processingIds.includes(item.id)}
                                            >
                                                {processingIds.includes(item.id) ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Play className="h-3 w-3 fill-emerald-600" />
                                                )}
                                                Enviar Agora
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
