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
import { Check, Clipboard, ExternalLink, HelpCircle, Code, Download, BookOpen, Key, AlertCircle } from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { toast } from "sonner"
import { ApiTokensManager } from "./api-tokens-manager"
import { WebhooksManager } from "./webhooks-manager"

interface IntegrationSetupSheetProps {
    integration: Integration | null
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId?: string
    apiTokens?: any[]
    webhooks?: any[]
}

export function IntegrationSetupSheet({ integration, open, onOpenChange, workspaceId, apiTokens, webhooks }: IntegrationSetupSheetProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const { activeWorkspace } = useWorkspace()

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copiado para a área de transferência!")
    }

    if (!integration) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
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
                        {/* WEBHOOKS ACTUAL CONFIG */}
                        {integration.id === 'webhook' && workspaceId && (
                            <div className="space-y-4 -mx-4 sm:mx-0">
                                <WebhooksManager workspaceId={workspaceId} initialWebhooks={webhooks || []} />
                            </div>
                        )}

                        {/* API TOKENS ACTUAL CONFIG */}
                        {integration.id === 'api' && workspaceId && (
                            <div className="space-y-4 -mx-4 sm:mx-0">
                                <ApiTokensManager workspaceId={workspaceId} initialTokens={apiTokens || []} />
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

                        {/* WORDPRESS SETUP */}
                        {integration.id === 'wordpress' && (
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-[#21759b] rounded-lg">
                                            <Download className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-base">Download do Plugin</h3>
                                            <p className="text-sm text-muted-foreground">Versão 1.2.0 (Mais recente)</p>
                                        </div>
                                        <Button className="ml-auto" size="sm">
                                            Baixar .zip
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        Chave de API
                                    </h4>
                                    <div className="space-y-2">
                                        <Label>Sua API Key</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value="sk_live_51M..."
                                                readOnly
                                                className="bg-muted font-mono text-xs"
                                            />
                                            <Button size="icon" variant="outline" onClick={() => copyToClipboard("sk_live_51M...")}>
                                                <Clipboard className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Copie esta chave para colar nas configurações do plugin no seu WordPress.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONFIG FOR LEGACY FORMS */}
                        {integration.id === 'legacy-forms' && (
                            <div className="space-y-6">
                                <div className="rounded-lg border p-4 bg-muted/30">
                                    <h4 className="font-medium mb-2 text-sm">Passo 1: Copie o Script</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Adicione este código antes do fechamento da tag <code>&lt;/body&gt;</code> do seu site.
                                    </p>
                                    <div className="relative group">
                                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                                            {`<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/lead-capture.js"
  data-workspace="${activeWorkspace?.id || 'SEU_WORKSPACE_ID'}"
  data-form-selector="form"
></script>`}
                                        </pre>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => copyToClipboard(`<script 
  src="${window.location.origin}/lead-capture.js"
  data-workspace="${activeWorkspace?.id || 'SEU_WORKSPACE_ID'}"
  data-form-selector="form"
></script>`)}
                                        >
                                            <Clipboard className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Passo 2: Configuração Opcional</h4>
                                    <div className="space-y-2">
                                        <Label>Seletor do Formulário (CSS)</Label>
                                        <Input placeholder="form" defaultValue="form" />
                                        <p className="text-xs text-muted-foreground">
                                            Caso seu site tenha múltiplos formulários, especifique qual deve ser capturado (ex: #contact-form).
                                            Atualize o atributo <code>data-form-selector</code> no script acima.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GENERIC MOCK FOR OTHERS */}
                        {!['webhook', 'api', 'google-sheets', 'legacy-forms'].includes(integration.id) && (
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
                        {!['legacy-forms', 'api', 'webhook'].includes(integration.id) && (
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                <Button>Salvar Integração</Button>
                            </div>
                        )}
                        {integration.id === 'legacy-forms' && (
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => onOpenChange(false)}>Concluído</Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="tutorial" className="space-y-4 mt-4">
                        <div className="prose prose-sm dark:prose-invert">
                            <div className="prose prose-sm dark:prose-invert">
                                {/* LEGACY FORMS TUTORIAL */}
                                {integration.id === 'legacy-forms' && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Como instalar</h4>
                                            <p className="text-muted-foreground">
                                                A instalação é simples e não requer conhecimentos avançados de programação.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 1: Copiar o Script</h4>
                                            <p className="text-muted-foreground">
                                                Vá até a aba <strong>Configuração</strong> e copie o código do script gerado para você.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 2: Inserir no Site</h4>
                                            <p className="text-muted-foreground">
                                                Abra o código HTML do seu site (ou configurações do CMS como WordPress/Shopify) e cole o script antes do fechamento da tag <code>&lt;/body&gt;</code>.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 3: Testar</h4>
                                            <p className="text-muted-foreground">
                                                Preencha e envie um formulário no seu site. O lead deverá aparecer automaticamente aqui no dashboard em instantes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {integration.id === 'wordpress' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4 rounded-lg bg-orange-50 border border-orange-100 p-4">
                                            <div className="flex gap-3">
                                                <BookOpen className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-orange-900 text-sm">Documentação Oficial</h4>
                                                    <p className="text-sm text-orange-700">Acesse o guia completo de instalação e configuração do plugin.</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-900">
                                                Ler Documentação <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 1: Instalação</h4>
                                            <p className="text-muted-foreground">
                                                No painel do seu WordPress, vá em <strong>Plugins &gt; Adicionar Novo</strong>. Clique em "Enviar Plugin" e selecione o arquivo .zip baixado.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 2: Ativação</h4>
                                            <p className="text-muted-foreground">
                                                Após o upload, clique em "Ativar Plugin". Você verá um novo menu chamado "Formulando" na barra lateral.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Passo 3: Conexão</h4>
                                            <p className="text-muted-foreground">
                                                Acesse as configurações do plugin e cole sua <strong>API Key</strong> (disponível na aba de Configuração). Clique em Salvar e pronto! Seus formulários já podem ser selecionados.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* API TUTORIAL */}
                                {integration.id === 'api' && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Como enviar leads via API</h4>
                                            <p className="text-muted-foreground mb-4">
                                                Envie leads de outras plataformas, landing pages ou sistemas próprios diretamente para o seu workspace no Formulando.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Autenticação</h4>
                                            <p className="text-muted-foreground">
                                                Todas as requisições devem incluir o header <code>Authorization: Bearer &lt;SEU_TOKEN&gt;</code>. Gere seu token na aba Configuração.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Endpoint</h4>
                                            <div className="flex items-center gap-3 bg-muted p-3 rounded-md mb-4 font-mono text-xs border">
                                                <span className="font-bold text-green-500">POST</span>
                                                <span>https://app.formulando.tech/api/v1/leads</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Payload (Body) de Exemplo</h4>
                                            <p className="text-muted-foreground mb-4 text-xs">
                                                O único campo estritamente obrigatório é o <code>email</code>. Quaisquer campos adicionais serão salvos como campos customizados.
                                            </p>
                                            <div className="relative group">
                                                <pre className="bg-slate-950 text-green-400 p-4 rounded-md border text-xs font-mono overflow-x-auto whitespace-pre">
                                                    {`{
  "name": "Maria Silva",
  "email": "maria@empresa.com", // Obrigatório
  "phone": "11999999999",
  "company": "Empresa S.A.",
  "job_title": "Diretora de Vendas",
  "minha_pergunta_customizada": "Gostaria de marcar uma demonstração."
}`}
                                                </pre>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-primary">Webhooks (Outbound API)</h4>
                                            <p className="text-muted-foreground">
                                                Se você precisa do caminho inverso (receber avisos quando o Formulando cria um lead), volte à página de Integrações e configure um <strong>Webhook</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* GENERIC TUTORIAL */}
                                {!['legacy-forms', 'wordpress', 'api'].includes(integration.id) && (
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
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
