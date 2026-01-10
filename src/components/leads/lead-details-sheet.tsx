"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Lead } from "@/actions/leads"
import { format } from "date-fns/format"
import { ptBR } from "date-fns/locale/pt-BR"
import { Separator } from "@/components/ui/separator"

interface LeadDetailsSheetProps {
    lead: Lead | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
    if (!lead) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Detalhes do Lead</SheetTitle>
                    <SheetDescription>
                        Enviado em {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        <br />
                        Formulário: <span className="font-semibold text-foreground">{lead.project_name}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {Object.entries(lead.data).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                            <h4 className="text-sm font-medium leading-none text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-sm border p-3 rounded-md bg-muted/30">
                                {typeof value === 'object'
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)
                                }
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <Separator className="my-4" />
                    <div className="text-xs text-muted-foreground">
                        ID do Lead: {lead.id}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
