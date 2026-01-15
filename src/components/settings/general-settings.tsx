"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useWorkspace } from "@/context/workspace-context"
import { useState, useEffect } from "react"
import { updateWorkspaceName } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"

export function GeneralSettings() {
    const { activeWorkspace, refreshWorkspaces } = useWorkspace()
    const [name, setName] = useState(activeWorkspace?.name || "")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (activeWorkspace) setName(activeWorkspace.name)
    }, [activeWorkspace])

    const handleSave = async () => {
        if (!activeWorkspace) return
        setIsLoading(true)
        try {
            const result = await updateWorkspaceName(activeWorkspace.id, name)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Workspace atualizado com sucesso!")
                refreshWorkspaces()
            }
        } catch (error) {
            toast.error("Erro ao atualizar workspace")
        } finally {
            setIsLoading(false)
        }
    }

    if (!activeWorkspace) return null

    return (
        <div className="space-y-6 max-w-4xl">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Workspace</CardTitle>
                    <CardDescription>
                        Configurações gerais do seu espaço de trabalho.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">Nome do Workspace</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">Logo</Label>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <Button variant="outline" size="sm" className="h-9 hover:bg-muted/50 border-border/50 gap-2 cursor-not-allowed opacity-50">
                                    <Upload className="h-4 w-4" />
                                    Alterar Logo
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="relative">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg border border-border/50">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20">
                        Em Desenvolvimento
                    </span>
                </div>
                <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm opacity-50 pointer-events-none">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Notificações</CardTitle>
                        <CardDescription>
                            Escolha o que você deseja receber por email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border border-border/40 bg-muted/20">
                            <Label className="flex flex-col space-y-1">
                                <span className="font-medium">Novos Leads</span>
                                <span className="font-normal text-xs text-muted-foreground">Receba um alerta quando um novo lead for capturado.</span>
                            </Label>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border border-border/40 bg-muted/20">
                            <Label className="flex flex-col space-y-1">
                                <span className="font-medium">Atualizações do Sistema</span>
                                <span className="font-normal text-xs text-muted-foreground">Novidades e atualizações sobre a plataforma.</span>
                            </Label>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    className="h-10 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Todas Alterações
                </Button>
            </div>
        </div>
    )
}
