"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Webhook, Plus, Loader2 } from "lucide-react"
import { createWebhook, toggleWebhook, deleteWebhook, WebhookConfig } from "@/actions/integrations"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function WebhooksManager({ workspaceId, initialWebhooks }: { workspaceId: string, initialWebhooks: WebhookConfig[] }) {
    const [webhooks, setWebhooks] = useState(initialWebhooks)
    const [isCreating, setIsCreating] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [secret, setSecret] = useState("")

    const handleCreate = async () => {
        if (!name.trim() || !url.trim()) {
            toast.error("Nome e URL são obrigatórios")
            return
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            toast.error("A URL deve começar com http:// ou https://")
            return
        }

        setIsCreating(true)
        try {
            await createWebhook(workspaceId, { name, url, secret })
            setIsDialogOpen(false)
            // Ideally we'd fetch the newly created one to append to state with its actual ID.
            // For simplicity in this UI pattern, we can trigger a router refresh or just trust the optimistic update.
            // Since we don't have the ID returned from the server hook easily without refactoring, we'll just reload the page for now 
            // natively or ask user to refresh. Since the action calls revalidatePath, reloading the window works well.
            window.location.reload()
            toast.success("Webhook criado com sucesso!")
        } catch (error: any) {
            toast.error(error.message || "Erro ao criar webhook")
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w))
            await toggleWebhook(id, workspaceId, !currentStatus)
            toast.success(currentStatus ? "Webhook desativado" : "Webhook ativado")
        } catch (error: any) {
            // Revert
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, is_active: currentStatus } : w))
            toast.error(error.message || "Erro ao alterar status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este webhook?")) return

        try {
            await deleteWebhook(id, workspaceId)
            setWebhooks(webhooks.filter(w => w.id !== id))
            toast.success("Webhook removido")
        } catch (error: any) {
            toast.error(error.message || "Erro ao remover webhook")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-start justify-between">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-primary" />
                        Webhooks Outbound
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Envie os novos leads instantaneamente para seus próprios sistemas ou automatizadores (Zapier, Make).
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Novo Webhook
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Webhook</DialogTitle>
                            <DialogDescription>
                                Configure uma URL para receber um POST sempre que um lead for criado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome / Identificação</Label>
                                <Input
                                    placeholder="Ex: Zapier CRM"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL de Destino</Label>
                                <Input
                                    placeholder="https://"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Secret (Opcional)</Label>
                                <Input
                                    type="password"
                                    placeholder="Segredo para assinatura do payload"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Se preenchido, os requests incluirão um header `X-Formulando-Signature` calculando o HMAC SHA-256 do payload.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={isCreating}>
                                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Salvar Webhook"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {webhooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        Nenhum webhook configurado.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead>Eventos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {webhooks.map((webhook) => (
                                    <TableRow key={webhook.id}>
                                        <TableCell>
                                            <Switch
                                                checked={webhook.is_active}
                                                onCheckedChange={() => handleToggle(webhook.id, webhook.is_active)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{webhook.name}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                            {webhook.url}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {webhook.events.map(ev => (
                                                    <Badge key={ev} variant="outline" className="text-xs">
                                                        {ev === 'lead.created' ? 'Novo Lead' : ev}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(webhook.id)}
                                            >
                                                Remover
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
