"use client"

import { WhatsAppConfig, updateWhatsAppConfig } from "@/actions/whatsapp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { Loader2 } from "lucide-react"

interface WhatsAppSettingsFormProps {
    config: WhatsAppConfig | null
    workspaceId: string
    onConfigChange: (newConfig: Partial<WhatsAppConfig>) => void
}

export function WhatsAppSettingsForm({ config, workspaceId, onConfigChange }: WhatsAppSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<WhatsAppConfig>>({
        phone_number: '',
        message_template: 'Olá! Gostaria de mais informações.',
        is_active: false,
        position: 'bottom-right',
        button_color: '#25D366',
        button_text: 'Falar no WhatsApp',
        icon_type: 'icon',
        button_icon: 'whatsapp',
        avatar_url: '',
        ...config
    })

    // Sync local state with preview
    useEffect(() => {
        onConfigChange(formData)
    }, [formData, onConfigChange])

    const handleChange = (key: keyof WhatsAppConfig, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateWhatsAppConfig(workspaceId, formData)
            toast.success("Configurações salvas com sucesso!")
        } catch (error) {
            toast.error("Erro ao salvar configurações.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4 rounded-lg border p-4 bg-card">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Ativar Widget</Label>
                        <p className="text-xs text-muted-foreground">Exibir botão no site</p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(c) => handleChange('is_active', c)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label>Número do WhatsApp (com DDD)</Label>
                    <Input
                        placeholder="5511999999999"
                        value={formData.phone_number}
                        onChange={(e) => handleChange('phone_number', e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">Apenas números. Formato internacional recomendado.</p>
                </div>

                <div className="grid gap-2">
                    <Label>Mensagem Inicial</Label>
                    <Textarea
                        placeholder="Mensagem que o usuário enviará"
                        value={formData.message_template}
                        onChange={(e) => handleChange('message_template', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Aparência</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Posição</Label>
                        <Select
                            value={formData.position}
                            onValueChange={(v) => handleChange('position', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bottom-right">Direita Inferior</SelectItem>
                                <SelectItem value="bottom-left">Esquerda Inferior</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Cor do Botão</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-12 p-1"
                                value={formData.button_color}
                                onChange={(e) => handleChange('button_color', e.target.value)}
                            />
                            <Input

                                value={formData.button_color}
                                onChange={(e) => handleChange('button_color', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Texto do Botão</Label>
                    <Input
                        value={formData.button_text}
                        onChange={(e) => handleChange('button_text', e.target.value)}
                        placeholder="Deixe vazio para apenas o ícone"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Ícone do Botão</h3>
                <Tabs
                    defaultValue={formData.icon_type || 'icon'}
                    onValueChange={(v) => handleChange('icon_type', v)}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="icon">Ícone Padrão</TabsTrigger>
                        <TabsTrigger value="avatar">Imagem / Avatar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="icon" className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label>Selecione o Ícone</Label>
                            <Select
                                value={formData.button_icon}
                                onValueChange={(v) => handleChange('button_icon', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="whatsapp">Logo WhatsApp</SelectItem>
                                    <SelectItem value="message">Balão de Mensagem</SelectItem>
                                    <SelectItem value="phone">Telefone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                    <TabsContent value="avatar" className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label>Upload de Imagem</Label>
                            <ImageUpload
                                value={formData.avatar_url || ''}
                                onChange={(url) => handleChange('avatar_url', url)}
                            />
                            <p className="text-xs text-muted-foreground">Recomendado: Imagem quadrada, min 100x100px. Será exibida redonda.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>

        </form>
    )
}
