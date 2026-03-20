"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Share2, Plus, Trash2, Facebook, Instagram, Linkedin, Twitter, Youtube, Phone, Globe, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PLATFORMS_CONFIG: Record<string, { label: string; icon: any; color: string; icon8: string }> = {
    instagram: { label: 'Instagram', icon: Instagram, color: '#E1306C', icon8: 'instagram-new' },
    facebook: { label: 'Facebook', icon: Facebook, color: '#1877F2', icon8: 'facebook-new' },
    linkedin: { label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', icon8: 'linkedin' },
    twitter: { label: 'Twitter', icon: Twitter, color: '#000000', icon8: 'twitterx' },
    youtube: { label: 'YouTube', icon: Youtube, color: '#FF0000', icon8: 'youtube' },
    whatsapp: { label: 'WhatsApp', icon: Phone, color: '#25D366', icon8: 'whatsapp' },
    tiktok: { label: 'TikTok', icon: Share2, color: '#000000', icon8: 'tiktok' },
    website: { label: 'Website', icon: Globe, color: '#3b82f6', icon8: 'icons8-web-48' },
    email: { label: 'Email', icon: Mail, color: '#6366f1', icon8: 'email' },
}

const PLATFORMS = Object.keys(PLATFORMS_CONFIG)

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id
    const items: Array<{ platform: string; url: string }> = p.items || [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }]
    const iconSize = p.iconSize || 32

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all py-3 ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ textAlign: p.align || 'center' }}
        >
            <div style={{ display: 'inline-flex', gap: `${p.gap || 8}px`, alignItems: 'center' }}>
                {items.map((item, i) => {
                    const config = PLATFORMS_CONFIG[item.platform] || PLATFORMS_CONFIG.website
                    const Icon = config.icon
                    return (
                        <div
                            key={i}
                            style={{
                                width: `${iconSize + 8}px`,
                                height: `${iconSize + 8}px`,
                                borderRadius: p.roundness === 'square' ? '4px' : '50%',
                                backgroundColor: p.variant === 'color' ? config.color : p.backgroundColor || '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: p.iconColor || '#fff',
                            }}
                            className="flex items-center justify-center overflow-hidden"
                        >
                            <Icon size={iconSize * 0.6} strokeWidth={2.5} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function PropertiesComponent({ element }: { element: EmailElementInstance }) {
    const { updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const items: Array<{ platform: string; url: string }> = p.items || []
    const update = (key: string, value: any) => updateElementProperties(element.id, { [key]: value })

    const updateItem = (index: number, key: string, value: string) => {
        const newItems = items.map((item, i) => i === index ? { ...item, [key]: value } : item)
        update('items', newItems)
    }

    const addItem = () => update('items', [...items, { platform: 'instagram', url: '#' }])
    const removeItem = (index: number) => update('items', items.filter((_, i) => i !== index))

    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content" className="text-xs">Conteúdo</TabsTrigger>
                <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold">Links das Redes</Label>
                    <div className="space-y-2 mt-2">
                        {items.map((item, i) => (
                            <div key={i} className="space-y-2 border rounded p-2 bg-white shadow-sm">
                                <div className="flex gap-1 items-center">
                                    <Select value={item.platform} onValueChange={v => updateItem(i, 'platform', v)}>
                                        <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-[10px]">{PLATFORMS_CONFIG[p].label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => removeItem(i)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Input value={item.url} onChange={e => updateItem(i, 'url', e.target.value)} className="h-7 text-[10px]" placeholder="URL do perfil" />
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs border-dashed" onClick={addItem}>
                            <Plus className="h-3 w-3 mr-1" /> Adicionar Perfil
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs font-semibold">Variante</Label>
                        <Select value={p.variant || 'color'} onValueChange={v => update('variant', v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="color" className="text-xs">Original</SelectItem>
                                <SelectItem value="custom" className="text-xs">Customizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold">Formato</Label>
                        <Select value={p.roundness || 'circle'} onValueChange={v => update('roundness', v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="circle" className="text-xs">Círculo</SelectItem>
                                <SelectItem value="square" className="text-xs">Quadrado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {p.variant === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-slate-50 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <Label className="text-[10px] font-bold">Cor Ícone</Label>
                            <div className="flex gap-1 mt-1">
                                <input type="color" value={p.iconColor || '#ffffff'} onChange={e => update('iconColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                                <Input value={p.iconColor || '#ffffff'} onChange={e => update('iconColor', e.target.value)} className="h-6 text-[9px] font-mono p-1" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] font-bold">Cor Fundo</Label>
                            <div className="flex gap-1 mt-1">
                                <input type="color" value={p.backgroundColor || '#333333'} onChange={e => update('backgroundColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                                <Input value={p.backgroundColor || '#333333'} onChange={e => update('backgroundColor', e.target.value)} className="h-6 text-[9px] font-mono p-1" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 border-t pt-4">
                    <div>
                        <Label className="text-xs font-semibold">Tam. Ícones</Label>
                        <Input type="number" value={p.iconSize || 32} onChange={e => update('iconSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold">Espaço</Label>
                        <Input type="number" value={p.gap || 12} onChange={e => update('gap', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                </div>

                <div>
                    <Label className="text-xs font-semibold">Alinhamento</Label>
                    <Select value={p.align || 'center'} onValueChange={v => update('align', v)}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left" className="text-xs">Esquerda</SelectItem>
                            <SelectItem value="center" className="text-xs">Centro</SelectItem>
                            <SelectItem value="right" className="text-xs">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </TabsContent>
        </Tabs>
    )
}

export const EmailSocialLinksElement: EmailElementDefinition = {
    type: 'email-social-links',
    designerBtnElement: { icon: Share2, label: 'Redes Sociais', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-social-links',
        properties: {
            items: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }, { platform: 'whatsapp', url: '#' }],
            iconSize: 32, gap: 12, align: 'center', variant: 'color', roundness: 'circle'
        },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const items: Array<{ platform: string; url: string }> = p.items || []
        const iconSize = p.iconSize || 32
        const cellSize = iconSize + 8

        const iconsHtml = items.map(item => {
            const config = PLATFORMS_CONFIG[item.platform] || PLATFORMS_CONFIG.website
            const bgColor = p.variant === 'color' ? config.color : p.backgroundColor || '#333333'
            const iconUrl = item.platform === 'website' 
                ? 'https://img.icons8.com/material-outlined/48/ffffff/globe.png'
                : `https://img.icons8.com/fluent-systems-filled/48/ffffff/${config.icon8}.png`
            
            return `<td style="padding:0 ${(p.gap || 12) / 2}px;">
<a href="${item.url}" target="_blank" style="display:inline-block;text-decoration:none;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td bgcolor="${bgColor}" style="width:${cellSize}px;height:${cellSize}px;border-radius:${p.roundness === 'square' ? '4px' : '50%'};text-align:center;vertical-align:middle;">
<img src="${iconUrl}" width="${iconSize * 0.6}" height="${iconSize * 0.6}" alt="${item.platform}" style="display:block;border:0;margin:0 auto;" />
</td></tr></table></a></td>`
        }).join('\n')

        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td align="${p.align || 'center'}" style="padding:12px 0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr>${iconsHtml}</tr></table>
</td></tr></table>`
    }
}
