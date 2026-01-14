"use client"


import { useEffect, useState } from "react"
import { getAutomations, toggleAutomation, deleteAutomation } from "@/actions/automations"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Trash2, Edit, PlayCircle, Zap } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function AutomationsList({ workspaceId }: { workspaceId: string }) {
    const [automations, setAutomations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadAutomations()
    }, [workspaceId])

    async function loadAutomations() {
        setIsLoading(true)
        try {
            const data = await getAutomations(workspaceId)
            setAutomations(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Erro ao carregar automações")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleToggle(id: string, current: boolean) {
        // Optimistic update
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))

        try {
            await toggleAutomation(id, !current)
            toast.success(current ? "Automação desativada" : "Automação ativada")
        } catch (error) {
            toast.error("Erro ao atualizar status")
            // Revert
            setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: current } : a))
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta automação?")) return

        try {
            await deleteAutomation(id)
            setAutomations(prev => prev.filter(a => a.id !== id))
            toast.success("Automação excluída")
        } catch (error) {
            toast.error("Erro ao excluir")
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }

    if (automations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/50 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Nenhuma automação criada</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    Crie fluxos automatizados para gerenciar seus leads, enviar e-mails e muito mais.
                </p>
                {/* Button is available in header too */}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {automations.map(auto => (
                <Card key={auto.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base truncate pr-2">{auto.name}</CardTitle>
                                <CardDescription className="text-xs">
                                    {auto.trigger_type === 'form_submission' ? 'Gatilho: Envio de Formulário' : 'Gatilho Manual'}
                                </CardDescription>
                            </div>
                            <Switch
                                checked={auto.is_active}
                                onCheckedChange={() => handleToggle(auto.id, auto.is_active)}
                            />
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-2">
                        <Badge variant="outline" className="text-xs font-normal">
                            {auto.is_active ? <span className="text-green-600 flex items-center gap-1">● Ativo</span> : <span className="text-muted-foreground">Inativo</span>}
                        </Badge>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(auto.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" asChild className="h-8 px-3 gap-2">
                                <Link href={`/dashboard/automations/${auto.id}`}>
                                    <Edit className="w-3.5 h-3.5" />
                                    Editar
                                </Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
