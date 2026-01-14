"use client"

import { useState } from "react"
import { updateLeadNotes } from "@/actions/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save, StickyNote } from "lucide-react"
import { toast } from "sonner"

interface LeadNotesProps {
    leadId: string
    initialNotes?: string
}

export function LeadNotes({ leadId, initialNotes }: LeadNotesProps) {
    const [notes, setNotes] = useState(initialNotes || "")
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value)
        setHasChanges(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateLeadNotes(leadId, notes)
            setHasChanges(false)
            toast.success("Notas salvas com sucesso!")
        } catch (error) {
            toast.error("Erro ao salvar notas")
        } finally {
            setIsSaving(false)
        }
    }

    // Auto-save on blur
    const handleBlur = () => {
        if (hasChanges) {
            handleSave()
        }
    }

    return (
        <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <StickyNote className="w-4 h-4" />
                    Notas & Observações
                </CardTitle>
                {hasChanges && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                        {isSaving ? "Salvando..." : "Salvar agora"}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Escreva observações importantes sobre este lead..."
                    className="min-h-[120px] resize-none border-amber-200 focus-visible:ring-amber-400 bg-white/50 dark:bg-black/20"
                    value={notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <p className="text-[10px] text-muted-foreground mt-2 text-right italic">
                    {hasChanges ? "Não salvo" : "Salvo"}
                </p>
            </CardContent>
        </Card>
    )
}
