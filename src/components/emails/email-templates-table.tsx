"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailTemplate } from "@/actions/emails"
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
import { Eye, Edit, Trash2, Mail } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EmailTemplatesTableProps {
    templates: EmailTemplate[]
}

export function EmailTemplatesTable({ templates }: EmailTemplatesTableProps) {
    const router = useRouter()

    if (templates.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum template criado</p>
                <p className="text-sm">Crie seu primeiro template de email para começar</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Nome</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {templates.map((template) => (
                        <TableRow
                            key={template.id}
                            className="cursor-pointer hover:bg-muted/30 group"
                            onClick={() => router.push(`/dashboard/emails/${template.id}`)}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {template.name}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                                <span className="truncate block text-sm text-muted-foreground">
                                    {template.subject}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {template.category}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={template.is_active ? "default" : "secondary"}
                                    className={cn(
                                        template.is_active
                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80"
                                            : ""
                                    )}
                                >
                                    {template.is_active ? "Ativo" : "Inativo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(template.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/dashboard/emails/${template.id}`)
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
