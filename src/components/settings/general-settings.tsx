"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useWorkspace } from "@/context/workspace-context"
import { useState, useEffect } from "react"
import { updateWorkspaceName, updateWorkspaceEmailSettings } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { Loader2, Upload, Mail } from "lucide-react"

export function GeneralSettings() {
    const { activeWorkspace, refreshWorkspaces } = useWorkspace()
    const [name, setName] = useState(activeWorkspace?.name || "")
    const [senderEmail, setSenderEmail] = useState("")
    const [senderName, setSenderName] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (activeWorkspace) {
            setName(activeWorkspace.name)
            setSenderEmail((activeWorkspace as any).sender_email || "")
            setSenderName((activeWorkspace as any).sender_name || "")
        }
    }, [activeWorkspace])

    const handleSave = async () => {
        if (!activeWorkspace) return
        setIsLoading(true)
        try {
            // Update workspace name
            const nameResult = await updateWorkspaceName(activeWorkspace.id, name)
            if (nameResult.error) {
                toast.error(nameResult.error)
                setIsLoading(false)
                return
            }

            // Update email settings
            const emailResult = await updateWorkspaceEmailSettings(
                activeWorkspace.id,
                senderEmail || null,
                senderName || null
            )
            if (emailResult.error) {
                toast.error(emailResult.error)
                setIsLoading(false)
                return
            }

            toast.success("Configurações atualizadas com sucesso!")
            refreshWorkspaces()
        } catch (error) {
            toast.error("Erro ao atualizar configurações")
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

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">Configurações de Email</CardTitle>
                    </div>
                    <CardDescription>
                        Configure o remetente dos emails enviados pelas automações deste workspace.
                        <br />
                        <span className="text-xs text-muted-foreground/80 mt-1 block">
                            💡 Os emails serão enviados do nosso sistema, mas as respostas irão para o email configurado abaixo (Reply-To).
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">
                                Email de Resposta
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                type="email"
                                placeholder="contato@seudominio.com"
                                value={senderEmail}
                                onChange={(e) => setSenderEmail(e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Quando leads responderem, o email virá para este endereço
                            </p>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">
                                Nome do Remetente
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                placeholder="Equipe Atendimento"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Nome que aparecerá como remetente do email
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                        <p className="text-sm text-foreground/80">
                            <strong>Como funciona:</strong> Os emails serão enviados de <code className="bg-muted px-1 py-0.5 rounded text-xs">noreply@formulando.app</code>, mas quando o destinatário clicar em "Responder", o email será direcionado para o endereço configurado acima.
                        </p>
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
