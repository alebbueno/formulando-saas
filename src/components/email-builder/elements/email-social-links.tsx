"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Share2, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'whatsapp', 'tiktok', 'website', 'email']

const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E1306C',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    whatsapp: '#25D366',
    tiktok: '#000000',
    website: '#3b82f6',
    email: '#6366f1',
}

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id
    const items: Array<{ platform: string; url: string }> = p.items || [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }]
    const iconSize = p.iconSize || 32

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all py-3 ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ textAlign: p.align || 'center' }}
        >
            <div style={{ display: 'inline-flex', gap: `${p.gap || 8}px`, alignItems: 'center' }}>
                {items.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${iconSize + 8}px`,
                            height: `${iconSize + 8}px`,
                            borderRadius: '50%',
                            backgroundColor: PLATFORM_COLORS[item.platform] || '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                    >
                        {item.platform.slice(0, 2).toUpperCase()}
                    </div>
                ))}
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
        <div className="space-y-4">
            <div>
                <Label className="text-xs">Redes sociais</Label>
                <div className="space-y-2 mt-2">
                    {items.map((item, i) => (
                        <div key={i} className="space-y-1 border rounded p-2">
                            <div className="flex gap-1 items-center">
                                <Select value={item.platform} onValueChange={v => updateItem(i, 'platform', v)}>
                                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => removeItem(i)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <Input value={item.url} onChange={e => updateItem(i, 'url', e.target.value)} className="h-7 text-xs" placeholder="URL" />
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={addItem}>
                        <Plus className="h-3 w-3 mr-1" /> Adicionar rede
                    </Button>
                </div>
            </div>
            <div>
                <Label className="text-xs">Tamanho dos ícones (px)</Label>
                <Input type="number" value={p.iconSize || 32} onChange={e => update('iconSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Espaço entre ícones (px)</Label>
                <Input type="number" value={p.gap || 8} onChange={e => update('gap', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Alinhamento</Label>
                <Select value={p.align || 'center'} onValueChange={v => update('align', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export const EmailSocialLinksElement: EmailElementDefinition = {
    type: 'email-social-links',
    designerBtnElement: { icon: Share2, label: 'Redes Sociais', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-social-links',
        properties: {
            items: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }, { platform: 'linkedin', url: '#' }],
            iconSize: 32, gap: 8, align: 'center'
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
            const color = PLATFORM_COLORS[item.platform] || '#333333'
            const label = item.platform.charAt(0).toUpperCase() + item.platform.slice(1)
            return `<td style="padding:0 ${(p.gap || 8) / 2}px;">
<a href="${item.url}" target="_blank" style="display:inline-block;text-decoration:none;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td bgcolor="${color}" style="width:${cellSize}px;height:${cellSize}px;border-radius:${cellSize / 2}px;text-align:center;vertical-align:middle;">
<span style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;color:#ffffff;line-height:${cellSize}px;">${label.slice(0, 2).toUpperCase()}</span>
</td></tr></table></a></td>`
        }).join('\n')

        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td align="${p.align || 'center'}" style="padding:12px 0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr>${iconsHtml}</tr></table>
</td></tr></table>`
    }
}
