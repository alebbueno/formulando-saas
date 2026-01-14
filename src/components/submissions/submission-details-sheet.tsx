"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Submission } from "@/actions/submissions"
import { format } from "date-fns/format"
import { ptBR } from "date-fns/locale/pt-BR"
import { Separator } from "@/components/ui/separator"

interface SubmissionDetailsSheetProps {
    submission: Submission | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubmissionDetailsSheet({ submission, open, onOpenChange }: SubmissionDetailsSheetProps) {
    if (!submission) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Detalhes da Submissão</SheetTitle>
                    <SheetDescription>
                        Enviado em {format(new Date(submission.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        <br />
                        Formulário: <span className="font-semibold text-foreground">{submission.project_name}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {Object.entries(submission.data).map(([key, value]) => (
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
                        ID: {submission.id}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
