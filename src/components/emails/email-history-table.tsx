"use client"

import { useState } from "react"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle,
    Mail,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { resendEmail } from "@/actions/email-logs"
import { toast } from "sonner"

interface EmailHistoryTableProps {
    logs: any[]
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
}

export function EmailHistoryTable({ 
    logs, 
    totalPages, 
    currentPage, 
    onPageChange 
}: EmailHistoryTableProps) {
    const [resendingId, setResendingId] = useState<string | null>(null)

    const handleResend = async (logId: string) => {
        setResendingId(logId)
        try {
            const result = await resendEmail(logId)
            if (result.success) {
                toast.success("E-mail reenviado com sucesso!")
            } else {
                toast.error(result.error || "Erro ao reenviar e-mail.")
            }
        } catch (error) {
            toast.error("Erro inesperado ao reenviar.")
        } finally {
            setResendingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-200"><Clock className="h-3 w-3" /> Enviado</Badge>
            case 'delivered':
                return <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3" /> Entregue</Badge>
            case 'failed':
                return <Badge variant="destructive" className="gap-1 bg-red-500/10 text-red-600 border-red-200 text-xs"><XCircle className="h-3 w-3" /> Falhou</Badge>
            case 'opened':
                return <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-600 border-purple-200"><Mail className="h-3 w-3" /> Aberto</Badge>
            case 'clicked':
                return <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-200"><RefreshCw className="h-3 w-3" /> Clicado</Badge>
            default:
                return <Badge variant="outline" className="gap-1">{status}</Badge>
        }
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                <Mail className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum histórico encontrado</h3>
                <p className="text-muted-foreground text-sm">Os e-mails disparados aparecerão aqui.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[200px]">Destinatário</TableHead>
                            <TableHead>Assunto / Template</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[150px]">Data</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium flex items-center gap-1.5 truncate max-w-[200px]">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {log.lead?.name || "Lead Desconhecido"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                            {log.recipient_email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium line-clamp-1">{log.subject}</span>
                                        <span className="text-[10px] text-primary flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {log.email_template?.name || "E-mail Direto"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(log.status)}
                                    {log.error_message && (
                                        <div className="mt-1 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            Ver erro
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    <span title={log.sent_at}>
                                        {formatDistanceToNow(new Date(log.sent_at), { 
                                            addSuffix: true,
                                            locale: ptBR
                                        })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        title="Reenviar"
                                        disabled={resendingId === log.id}
                                        onClick={() => handleResend(log.id)}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${resendingId === log.id ? "animate-spin" : ""}`} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                    <p className="text-xs text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Próximo <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
