"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Integration } from "./integration-card"
import { Check, Clipboard, ExternalLink, HelpCircle } from "lucide-react"

interface IntegrationSetupSheetProps {
    integration: Integration | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function IntegrationSetupSheet({ integration, open, onOpenChange }: IntegrationSetupSheetProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (!integration) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                            <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <SheetTitle>{integration.title}</SheetTitle>
                            <SheetDescription>Configure a integração</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="setup">Configuração</TabsTrigger>
                        <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Como funciona
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Esta integração permite conectar o Formulando com o <strong>{integration.title}</strong> para automatizar seu fluxo de trabalho.
                                    Os dados dos leads serão enviados automaticamente assim que um novo formulário for preenchido.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Recursos disponíveis:</h4>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Sincronização em tempo real
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Mapeamento automático de campos
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Logs de envio
                                    </li>
                                </ul>
                            </div>

                            <Button className="w-full mt-4" onClick={() => setActiveTab("setup")}>
                                Começar Configuração
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="setup" className="space-y-6 mt-4">
                        {/* MOCK CONFIG FOR WEBHOOK */}
                        {integration.id === 'webhook' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>URL do Webhook</Label>
                                    <Input placeholder="https://seu-sistema.com/webhook" />
                                    <p className="text-xs text-muted-foreground">URL para onde enviaremos o POST request.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Secret Key (Opcional)</Label>
                                    <Input type="password" placeholder="wh_sec_..." />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label>Ativar disparo</Label>
                                        <p className="text-xs text-muted-foreground">Enviar dados automaticamente</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        )}

                        {/* MOCK CONFIG FOR GOOGLE SHEETS */}
                        {integration.id === 'google-sheets' && (
                            <div className="space-y-4">
                                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <ExternalLink className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">Conexão necessária</h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>Você precisa autenticar com sua conta Google para continuar.</p>
                                            </div>
                                            <div className="mt-4">
                                                <Button variant="outline" size="sm" className="bg-white">
                                                    Conectar Google Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <Label>Selecionar Planilha</Label>
                                    <Input placeholder="Selecione uma planilha..." disabled />
                                </div>
                            </div>
                        )}

                        {/* GENERIC MOCK FOR OTHERS */}
                        {!['webhook', 'google-sheets'].includes(integration.id) && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input placeholder={`Sua API Key do ${integration.title}`} />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label>Modo Sandbox</Label>
                                        <p className="text-xs text-muted-foreground">Usar ambiente de testes</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        )}

                        <Separator />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button>Salvar Integração</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="tutorial" className="space-y-4 mt-4">
                        <div className="prose prose-sm dark:prose-invert">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-primary">Passo 1: Preparação</h4>
                                    <p className="text-muted-foreground">
                                        Acesse o painel do <strong>{integration.title}</strong> e navegue até as configurações de API/Integração.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-primary">Passo 2: Credenciais</h4>
                                    <p className="text-muted-foreground">
                                        Copie a chave de API ou URL do Webhook fornecida.
                                    </p>
                                    <div className="bg-muted p-3 rounded-md flex items-center justify-between text-xs font-mono">
                                        <span>xyz_123_abc_token_exemplo</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6">
                                            <Clipboard className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-primary">Passo 3: Ativação</h4>
                                    <p className="text-muted-foreground">
                                        Cole os dados na aba "Configuração" e clique em Salvar. Faça um envio de teste do seu formulário para validar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
