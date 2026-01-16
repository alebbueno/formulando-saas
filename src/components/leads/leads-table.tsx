"use client"

import { useState } from "react"
import { Lead } from "@/actions/leads"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, TrendingUp, Building2, User } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LeadDetailsSheet } from "@/components/leads/lead-details-sheet"
import { cn } from "@/lib/utils"

interface LeadsTableProps {
    leads: Lead[]
    totalPages: number
    currentPage: number
}

export function LeadsTable({ leads, totalPages, currentPage }: LeadsTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", newPage.toString())
        router.push(`?${params.toString()}`)
    }

    if (leads.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                Nenhum lead encontrado.
            </div>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return "text-emerald-700 bg-emerald-50 border-emerald-200"
        if (score >= 30) return "text-amber-700 bg-amber-50 border-amber-200"
        return "text-red-700 bg-red-50 border-red-200"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Qualificado': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200'
            case 'Novo Lead': return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200'
            case 'Em contato': return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200'
            case 'Oportunidade': return 'bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200'
            case 'Perdido': return 'bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200'
            default: return 'bg-secondary text-secondary-foreground'
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px]">Lead</TableHead>
                            <TableHead>Empresa / Cargo</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => {
                            const initials = lead.name?.substring(0, 2).toUpperCase() || "??"
                            return (
                                <TableRow
                                    key={lead.id}
                                    className="cursor-pointer hover:bg-muted/30 group"
                                    onClick={() => setSelectedLead(lead)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border bg-muted">
                                                <AvatarFallback className="text-xs font-bold text-muted-foreground">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm leading-none">{lead.name || "Sem nome"}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{lead.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                <span>{lead.company || "-"}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground pl-5">{lead.job_title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs gap-0.5">
                                            {lead.utm_source && (
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                                        {lead.utm_source}
                                                    </Badge>
                                                    {lead.utm_campaign && (
                                                        <span className="text-muted-foreground truncate max-w-[120px]">
                                                            {lead.utm_campaign}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {!lead.utm_source && (
                                                <span className="text-muted-foreground">Direto</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("font-medium border shadow-sm", getStatusColor(lead.status))}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border", getScoreColor(lead.score))}>
                                            <TrendingUp className="w-3 h-3" />
                                            {lead.score}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedLead(lead)
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Ver detalhes</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {Math.max(1, totalPages)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Próxima
                </Button>
            </div>

            <LeadDetailsSheet
                lead={selectedLead}
                open={!!selectedLead}
                onOpenChange={(open) => !open && setSelectedLead(null)}
            />
        </div>
    )
}
