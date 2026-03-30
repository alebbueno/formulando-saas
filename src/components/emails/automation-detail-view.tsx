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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Play, 
    Loader2, 
    Mail,
    RefreshCw,
    ChevronLeft,
    Filter,
    ArrowRight
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { 
    deleteScheduledLog, 
    processScheduledLogNow, 
    getScheduledIdsByTemplate 
} from "@/actions/email-logs"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AutomationDetailViewProps {
    templateId: string
    workspaceId: string
    templateName: string
    initialStats: {
        sent: number
        pending: number
        failed: number
        total: number
    }
    initialLogs: any[]
}

export function AutomationDetailView({ 
    templateId, 
    workspaceId, 
    templateName,
    initialStats, 
    initialLogs 
}: AutomationDetailViewProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [processingIds, setProcessingIds] = useState<string[]>([])
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)
    const [processedCount, setProcessedCount] = useState(0)
    const [totalToProcess, setTotalToProcess] = useState(0)
    const [filter, setFilter] = useState<string>("all")

    const filteredLogs = initialLogs.filter(log => {
        if (filter === "all") return true
        if (filter === "pending") return ["scheduled", "pending"].includes(log.status)
        return log.status === filter
    })

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

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return
        startTransition(async () => {
            const result = await deleteScheduledLog(id)
            if (result.success) {
                toast.success("Agendamento cancelado")
                router.refresh()
            }
        })
    }

    const handleProcessQueue = async () => {
        if (!confirm(`Deseja processar os e-mails pendentes para "${templateName}"?`)) return
        
        setIsBulkProcessing(true)
        setProcessedCount(0)
        
        try {
            const allIds = await getScheduledIdsByTemplate(templateId, workspaceId)
            setTotalToProcess(allIds.length)
            
            if (allIds.length === 0) {
                toast.info("Nenhum e-mail pendente")
                setIsBulkProcessing(false)
                return
            }

            const batchSize = 2
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize)
                await Promise.all(batch.map(async (id) => {
                    await processScheduledLogNow(id)
                    setProcessedCount(prev => prev + 1)
                }))
                // Delay to stay within rate limits/timeouts
                await new Promise(resolve => setTimeout(resolve, 800))
            }
            
            toast.success("Fila da automação processada!")
        } catch (error) {
            toast.error("Erro no processamento")
        } finally {
            setIsBulkProcessing(false)
            router.refresh()
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/emails/scheduler">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{templateName}</h2>
                        <p className="text-sm text-muted-foreground">Detalhes e histórico desta automação</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isBulkProcessing ? (
                        <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full text-xs font-bold text-primary border border-primary/20">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {processedCount} / {totalToProcess}
                        </div>
                    ) : (
                        <Button 
                            onClick={handleProcessQueue}
                            disabled={initialStats.pending === 0}
                            className="gap-2"
                        >
                            <Play className="h-3 w-3 fill-current" />
                            Processar Agora
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-emerald-500/10 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Enviados</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialStats.sent}</div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Aguardando</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialStats.pending}</div>
                    </CardContent>
                </Card>

                <Card className="border-rose-500/10 bg-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Erros</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialStats.failed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Table */}
            <Card>
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-muted px-3 py-1 rounded-md flex items-center gap-2">
                            <Filter className="h-3 w-3 text-muted-foreground" />
                            <select 
                                className="bg-transparent text-xs font-semibold outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Todos os Status</option>
                                <option value="pending">Aguardando</option>
                                <option value="sent">Enviados</option>
                                <option value="failed">Erros</option>
                            </select>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", isPending && "animate-spin")} />
                        Atualizar
                    </Button>
                </div>
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead>Destinatário</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    Nenhum registro encontrado para este filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map(log => (
                                <TableRow key={log.id} className="group/row">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{log.lead?.name || "Sem Nome"}</span>
                                            <span className="text-[10px] text-muted-foreground">{log.recipient_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        <span className="text-sm font-medium">{log.subject}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {log.status === "sent" && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Enviado</Badge>}
                                        {["scheduled", "pending"].includes(log.status) && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Agendado</Badge>}
                                        {log.status === "failed" && <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100" title={log.error_message}>Erro</Badge>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-xs text-muted-foreground">
                                            {log.status === "sent" 
                                                ? format(new Date(log.sent_at), "dd/MM HH:mm")
                                                : format(new Date(log.scheduled_for), "dd/MM HH:mm")
                                            }
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {["scheduled", "pending"].includes(log.status) ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-emerald-600"
                                                    onClick={() => handleProcessNow(log.id)}
                                                    disabled={processingIds.includes(log.id) || isBulkProcessing}
                                                >
                                                    {processingIds.includes(log.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-rose-600"
                                                    onClick={() => handleDelete(log.id)}
                                                    disabled={isPending || isBulkProcessing}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/dashboard/emails/history`}>
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        )}
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
