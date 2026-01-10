"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Laptop, Moon, Sun } from "lucide-react"

export function GeneralSettings() {
    const { setTheme, theme } = useTheme()

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
                            <Input defaultValue="Meu Workspace" className="bg-muted/30 border-border/50 focus:border-primary/50" />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">Logo</Label>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
                                    M
                                </div>
                                <Button variant="outline" size="sm" className="h-9 hover:bg-muted/50 border-border/50">Alterar Logo</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Aparência</CardTitle>
                    <CardDescription>
                        Personalize como o painel aparece para você.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Label className="text-sm text-foreground/80">Tema</Label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme("light")}
                                className="flex items-center gap-2 h-9 min-w-[100px]"
                            >
                                <Sun className="h-4 w-4" /> Claro
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme("dark")}
                                className="flex items-center gap-2 h-9 min-w-[100px]"
                            >
                                <Moon className="h-4 w-4" /> Escuro
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme("system")}
                                className="flex items-center gap-2 h-9 min-w-[100px]"
                            >
                                <Laptop className="h-4 w-4" /> Sistema
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Notificações</CardTitle>
                    <CardDescription>
                        Escolha o que você deseja receber por email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                        <Label htmlFor="leads_notification" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-medium">Novos Leads</span>
                            <span className="font-normal text-xs text-muted-foreground">Receba um alerta quando um novo lead for capturado.</span>
                        </Label>
                        <Switch id="leads_notification" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                        <Label htmlFor="system_notification" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-medium">Atualizações do Sistema</span>
                            <span className="font-normal text-xs text-muted-foreground">Novidades e atualizações sobre a plataforma.</span>
                        </Label>
                        <Switch id="system_notification" />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button className="h-10 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Salvar Todas Alterações
                </Button>
            </div>
        </div>
    )
}
