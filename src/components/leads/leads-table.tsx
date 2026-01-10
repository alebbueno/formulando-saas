"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { ptBR } from "date-fns/locale/pt-BR"
import { Lead } from "@/actions/leads"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface LeadsTableProps {
    leads: Lead[]
    onViewDetails: (lead: Lead) => void
}

export function LeadsTable({ leads, onViewDetails }: LeadsTableProps) {
    if (leads.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Nenhum lead encontrado com os filtros selecionados.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Formulário</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => {
                        // Attempt to find common name/email keys case-insensitively
                        const dataKeys = Object.keys(lead.data);
                        const nameKey = dataKeys.find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name'));
                        const emailKey = dataKeys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('e-mail'));

                        const name = nameKey ? lead.data[nameKey] : 'N/A';
                        const email = emailKey ? lead.data[emailKey] : 'N/A';

                        return (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{name}</TableCell>
                                <TableCell>{email}</TableCell>
                                <TableCell>{lead.project_name || 'Desconhecido'}</TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(lead.created_at), {
                                        addSuffix: true,
                                        locale: ptBR,
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onViewDetails(lead)}
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
    )
}
