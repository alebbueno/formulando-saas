"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all py-2 ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ textAlign: p.align || 'center' }}
        >
            {p.src ? (
                <img
                    src={p.src}
                    alt={p.alt || ''}
                    style={{ maxWidth: '100%', width: p.width ? `${p.width}px` : '100%', borderRadius: `${p.borderRadius || 0}px`, display: 'inline-block' }}
                />
            ) : (
                <div className="border-2 border-dashed border-slate-300 rounded bg-slate-50 flex flex-col items-center justify-center py-8 text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Adicione a URL da imagem</span>
                </div>
            )}
        </div>
    )
}

function PropertiesComponent({ element }: { element: EmailElementInstance }) {
    const { updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const update = (key: string, value: any) => updateElementProperties(element.id, { [key]: value })

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-xs">URL da imagem</Label>
                <Input value={p.src || ''} onChange={e => update('src', e.target.value)} className="h-8 text-xs mt-1" placeholder="https://..." />
            </div>
            <div>
                <Label className="text-xs">Texto alternativo (alt)</Label>
                <Input value={p.alt || ''} onChange={e => update('alt', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Link (opcional)</Label>
                <Input value={p.href || ''} onChange={e => update('href', e.target.value)} className="h-8 text-xs mt-1" placeholder="https://" />
            </div>
            <div>
                <Label className="text-xs">Largura (px, deixe vazio para 100%)</Label>
                <Input type="number" value={p.width || ''} onChange={e => update('width', e.target.value ? Number(e.target.value) : undefined)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Border radius (px)</Label>
                <Input type="number" value={p.borderRadius || 0} onChange={e => update('borderRadius', Number(e.target.value))} className="h-8 text-xs mt-1" />
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
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Padding cima</Label>
                    <Input type="number" value={p.paddingTop ?? 8} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding baixo</Label>
                    <Input type="number" value={p.paddingBottom ?? 8} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
    )
}

export const EmailImageElement: EmailElementDefinition = {
    type: 'email-image',
    designerBtnElement: { icon: ImageIcon, label: 'Imagem', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-image',
        properties: { src: '', alt: '', href: '', align: 'center', borderRadius: 0, paddingTop: 8, paddingBottom: 8 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const imgWidth = p.width ? `width="${p.width}"` : 'width="600"'
        const imgStyle = `max-width:100%;${p.width ? `width:${p.width}px;` : 'width:100%;'}border-radius:${p.borderRadius || 0}px;display:block;border:0;`
        const imgTag = `<img src="${p.src || ''}" alt="${p.alt || ''}" border="0" ${imgWidth} style="${imgStyle}" />`
        const linked = p.href ? `<a href="${p.href}" target="_blank" style="display:block;">${imgTag}</a>` : imgTag
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td align="${p.align || 'center'}" style="padding:${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px;">${linked}</td></tr></table>`
    }
}
