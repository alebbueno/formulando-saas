"use client"

import { useState } from "react"
import { WhatsAppConfig } from "@/actions/whatsapp"
import { WhatsAppSettingsForm } from "./whatsapp-settings-form"
import { WhatsAppPreview } from "./whatsapp-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

interface ClientPageWrapperProps {
    config: WhatsAppConfig | null
    workspaceId: string
}

export function ClientPageWrapper({ config, workspaceId }: ClientPageWrapperProps) {
    const [previewConfig, setPreviewConfig] = useState<Partial<WhatsAppConfig>>(config || {})

    const scriptCode = `<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/whatsapp-widget.js"
  data-workspace="${workspaceId}"
></script>`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scriptCode)
        toast.success("Código copiado!")
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            <div className="lg:col-span-5 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração</CardTitle>
                        <CardDescription>Personalize o comportamento e aparência</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WhatsAppSettingsForm
                            config={config}
                            workspaceId={workspaceId}
                            onConfigChange={setPreviewConfig}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instalação</CardTitle>
                        <CardDescription>Adicione este código ao seu site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>Para instalar o widget, siga os passos abaixo:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Configure a aparência e clique em "Salvar Alterações".</li>
                                <li>Copie o código abaixo.</li>
                                <li>Cole o código antes do fechamento da tag <code className="bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code> em seu site.</li>
                            </ol>
                        </div>

                        <div className="relative group">
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                                {scriptCode}
                            </pre>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={copyToClipboard}
                            >
                                <Clipboard className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-7">
                <div className="sticky top-6">
                    <h3 className="text-lg font-medium mb-4">Preview em Tempo Real</h3>
                    <WhatsAppPreview config={previewConfig} />
                </div>
            </div>
        </div>
    )
}
