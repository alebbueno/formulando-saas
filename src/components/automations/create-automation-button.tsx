"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Loader2 } from "lucide-react"
import { createAutomation } from "@/actions/automations"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspace } from "@/context/workspace-context"

const TEMPLATES = [
    {
        id: 'scratch',
        title: 'Em branco',
        description: 'Comece do zero com apenas um gatilho.',
        icon: Plus
    },
    {
        id: 'simple-email',
        title: 'Email Simples',
        description: 'Envia um email imediato após o formulário.',
        icon: Plus
    },
    {
        id: 'tag-qualify',
        title: 'Qualificar & Taggear',
        description: 'Adiciona tag "Novo Lead" e muda status.',
        icon: Plus
    },
    {
        id: 'webhook-integration',
        title: 'Webhook Externo',
        description: 'Envia dados para um webhook externo.',
        icon: Plus
    }
]

export function CreateAutomationButton() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState("scratch")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { activeWorkspace } = useWorkspace()

    async function handleCreate() {
        if (!name.trim()) return
        if (!activeWorkspace) {
            toast.error("Nenhum workspace selecionado")
            return
        }

        setIsLoading(true)
        try {
            // Updated action call includes templateId
            const result = await createAutomation(name, activeWorkspace.id, undefined, selectedTemplate)
            if (result.success) {
                toast.success("Automação criada!")
                setOpen(false)
                router.push(`/dashboard/automations/${result.id}`)
                // Reset form
                setName("")
                setSelectedTemplate("scratch")
            }
        } catch (error) {
            toast.error("Erro ao criar automação")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Automação
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Criar nova automação</DialogTitle>
                    <DialogDescription>
                        Escolha um template ou comece do zero.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <Label>Escolha um Template</Label>
                        <ScrollArea className="h-[200px] rounded-md border p-2">
                            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate} className="grid grid-cols-2 gap-3">
                                {TEMPLATES.map(template => (
                                    <div key={template.id}>
                                        <RadioGroupItem value={template.id} id={template.id} className="peer sr-only" />
                                        <Label
                                            htmlFor={template.id}
                                            className={cn(
                                                "flex flex-col justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full",
                                            )}
                                        >
                                            <span className="mb-2 font-semibold flex items-center gap-2">
                                                {template.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground leading-snug">
                                                {template.description}
                                            </span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome da Automação</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Processar Lead Site"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim() || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Automação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
