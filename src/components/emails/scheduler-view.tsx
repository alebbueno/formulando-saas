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
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Play, 
    Loader2, 
    Mail,
    RefreshCw,
    Activity,
    Layers,
    ArrowRight,
    ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { processScheduledLogNow, getScheduledQueueIds } from "@/actions/email-logs"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)
    const [processedCount, setProcessedCount] = useState(0)
    const [totalToProcess, setTotalToProcess] = useState(0)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Grouping Logic for the summary table
    const groupedQueue = useMemo(() => {
        const groups: Record<string, { name: string, count: number, latest: string }> = {}
        
        initialQueue.forEach(item => {
            const templateName = item.email_template?.name || "Envio Direto"
            const templateId = item.template_id || "direct"
            
            if (!groups[templateId]) {
                groups[templateId] = { name: templateName, count: 0, latest: item.scheduled_for }
            }
            groups[templateId].count++
        })
        
        return Object.entries(groups).map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
    }, [initialQueue])

    const handleProcessAll = async () => {
        setShowConfirmModal(false)
        
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

            const batchSize = 2 // Small batch for consistency
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize)
                await Promise.all(batch.map(async (id) => {
                    await processScheduledLogNow(id)
                    setProcessedCount(prev => prev + 1)
                }))
                
                // Small sleep to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 800))
            }
            
            toast.success("Todos os emails foram processados com sucesso!")
        } catch (error) {
            toast.error("Erro durante o processamento")
        } finally {
            setIsBulkProcessing(false)
            router.refresh()
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/10 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Aguardando Envio</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.scheduled + initialMetrics.pending}</div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/10 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Enviados (24h)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.sent24h}</div>
                    </CardContent>
                </Card>

                <Card className="border-rose-500/10 bg-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Falhas (24h)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{initialMetrics.failed24h}</div>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/10 bg-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Estado do Cron</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-black uppercase text-orange-600 flex items-center gap-1.5">
                            Ativo (Diário)
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Queue Table Summary */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Filas por Automação
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Clique em uma automação para ver todos os e-mails e histórico.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isBulkProcessing ? (
                            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full text-xs font-bold text-primary border border-primary/20 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processando: {processedCount} / {totalToProcess}
                            </div>
                        ) : (
                            <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="default" 
                                        size="sm" 
                                        className="h-10 gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                        disabled={initialQueue.length === 0}
                                    >
                                        <Play className="h-3 w-3 fill-current" />
                                        Processar Toda a Fila
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Processamento em Lote</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Isso irá processar todos os e-mails agendados sequencialmente. 
                                            <br /><br />
                                            <strong>IMPORTANTE:</strong> Mantenha esta aba aberta até o final do processamento para garantir o envio.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Agora não</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleProcessAll}>Sim, processar tudo</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 w-10 p-0"
                            onClick={() => router.refresh()}
                            disabled={isBulkProcessing}
                        >
                            <RefreshCw className={cn("h-4 w-4", (isPending || isBulkProcessing) && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Automação / Template</TableHead>
                                <TableHead className="text-center">E-mails Pendentes</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedQueue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail className="h-8 w-8 opacity-20" />
                                            <p>Nenhuma automação com e-mails pendentes.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groupedQueue.map((group) => (
                                    <TableRow key={group.id} className="group/row">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-bold text-sm lg:text-base">{group.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-mono font-bold text-primary">
                                            <Badge variant="secondary" className="h-6 px-3 bg-primary/5 text-primary">
                                                {group.count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="group-hover/row:bg-primary group-hover/row:text-white transition-all rounded-full px-4 gap-2">
                                                <Link href={`/dashboard/emails/scheduler/${group.id}`}>
                                                    Ver Detalhes
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
