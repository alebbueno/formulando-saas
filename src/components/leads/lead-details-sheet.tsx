"use client"

import { Lead } from "@/actions/leads"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Calendar, Tag, TrendingUp, Hash, Mail, ExternalLink, Phone } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { deleteLead } from "@/actions/leads"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface LeadDetailsSheetProps {
    lead: Lead | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onDelete?: (leadId: string) => void
}

export function LeadDetailsSheet({ lead, open, onOpenChange, onDelete }: LeadDetailsSheetProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    if (!lead) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteLead(lead.id)
            toast.success("Lead excluído com sucesso")
            onOpenChange(false)
            if (onDelete) {
                onDelete(lead.id)
            }
        } catch (error) {
            toast.error("Erro ao excluir lead")
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const initials = lead.name?.substring(0, 2).toUpperCase() || "??"

    let scoreColor = "text-muted-foreground bg-muted"
    if (lead.score >= 70) scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-200"
    else if (lead.score >= 30) scoreColor = "text-amber-700 bg-amber-50 border-amber-200"
    else scoreColor = "text-red-700 bg-red-50 border-red-200"

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col p-0 gap-0 border-l shadow-2xl">

                {/* Visual Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-pink-900/40 shrink-0">
                    <div className="absolute top-4 right-4">

                    </div>
                    <div className="absolute -bottom-10 left-6">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                            <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="pt-12 px-6 pb-4">
                    <SheetHeader className="space-y-1 text-left">
                        <SheetTitle className="text-2xl font-bold">{lead.name}</SheetTitle>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">{lead.email}</a>
                            </div>
                            {lead.phone && (
                                <div className="flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5" /> {/* Using Hash for phone for now or Phone icon if available */}
                                    <span>{lead.phone}</span>
                                </div>
                            )}
                        </div>
                    </SheetHeader>

                    <div className="flex items-center gap-3 mt-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${scoreColor}`}>
                            <TrendingUp className="w-3.5 h-3.5" />
                            {lead.score} pts
                        </div>
                        <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                            {lead.status}
                        </Badge>
                    </div>
                </div>

                <Separator />

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {/* Business Info */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5" />
                                Profissional
                            </h4>
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <span className="text-sm text-muted-foreground">Empresa</span>
                                    <span className="text-sm font-medium">{lead.company || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <span className="text-sm text-muted-foreground">Cargo</span>
                                    <span className="text-sm font-medium">{lead.job_title || "-"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Score Reason */}
                        {lead.score_reason && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                    Motivo do Score
                                </h4>
                                <div className="bg-muted/30 p-3 rounded-lg border text-sm text-foreground/80 leading-relaxed italic">
                                    "{lead.score_reason}"
                                </div>
                            </div>
                        )}

                        {/* Custom Fields */}
                        {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" />
                                    Detalhes
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(lead.custom_fields)
                                        .filter(([key]) => !key.startsWith('_') && !key.startsWith('wpcf7') && key !== 'metadata')
                                        .map(([key, value]) => (
                                            <div key={key} className="flex flex-col p-3 rounded-lg border bg-background/50">
                                                <span className="text-xs text-muted-foreground font-medium uppercase mb-1">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-sm font-medium break-words">{String(value)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {lead.tags && lead.tags.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" />
                                    Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {lead.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium border shadow-sm bg-background">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-60">
                            <Calendar className="w-3 h-3" />
                            Criado {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/10 shrink-0 flex flex-col gap-2">
                    <Button className="w-full gap-2 shadow-sm font-semibold" size="lg" asChild>
                        <Link href={`/dashboard/leads/${lead.id}`}>
                            Ver Perfil Completo
                            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                        </Link>
                    </Button>

                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-xs text-muted-foreground hover:text-destructive underline-offset-4 hover:underline transition-colors py-1 self-center"
                    >
                        Excluir lead
                    </button>
                </div>

            </SheetContent>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Lead permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o lead
                            <strong> {lead.name}</strong> e todos os dados associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Excluindo..." : "Excluir Lead"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sheet>
    )
}
