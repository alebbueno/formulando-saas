"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { MousePointer2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EMAIL_SAFE_FONTS, FONT_WEIGHTS } from "../constants"

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
            <span
                style={{
                    display: 'inline-block',
                    backgroundColor: p.backgroundColor || '#3b82f6',
                    color: p.textColor || '#ffffff',
                    fontSize: `${p.fontSize || 16}px`,
                    fontWeight: p.fontWeight || 'bold',
                    padding: `${p.paddingV || 12}px ${p.paddingH || 24}px`,
                    borderRadius: `${p.borderRadius || 4}px`,
                    textDecoration: 'none',
                    fontFamily: p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                }}
            >
                {p.text || 'Clique aqui'}
            </span>
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
                <Label className="text-xs">Texto do botão</Label>
                <Input value={p.text || ''} onChange={e => update('text', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Link (URL)</Label>
                <Input value={p.href || '#'} onChange={e => update('href', e.target.value)} className="h-8 text-xs mt-1" placeholder="https://" />
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#3b82f6'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || '#3b82f6'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Cor do texto</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.textColor || '#ffffff'} onChange={e => update('textColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.textColor || '#ffffff'} onChange={e => update('textColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
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
                    <Label className="text-xs">Padding vertical</Label>
                    <Input type="number" value={p.paddingV || 12} onChange={e => update('paddingV', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding horizontal</Label>
                    <Input type="number" value={p.paddingH || 24} onChange={e => update('paddingH', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Fonte</Label>
                    <Select value={p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif'} onValueChange={v => update('fontFamily', v)}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="w-[180px]">
                            {EMAIL_SAFE_FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Peso da Fonte</Label>
                    <Select value={p.fontWeight || 'bold'} onValueChange={v => update('fontWeight', v)}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {FONT_WEIGHTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Tamanho fonte</Label>
                    <Input type="number" value={p.fontSize || 16} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Border radius</Label>
                    <Input type="number" value={p.borderRadius || 4} onChange={e => update('borderRadius', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
    )
}

export const EmailButtonElement: EmailElementDefinition = {
    type: 'email-button',
    designerBtnElement: { icon: MousePointer2, label: 'Botão', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-button',
        properties: { text: 'Clique aqui', href: '#', backgroundColor: '#3b82f6', textColor: '#ffffff', fontSize: 16, fontWeight: 'bold', paddingV: 12, paddingH: 24, borderRadius: 4, align: 'center' },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td align="${p.align || 'center'}" style="padding:8px 0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td bgcolor="${p.backgroundColor || '#3b82f6'}" style="border-radius:${p.borderRadius || 4}px;">
<a href="${p.href || '#'}" target="_blank" style="display:inline-block;font-family:${p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'};font-size:${p.fontSize || 16}px;font-weight:${p.fontWeight || 'bold'};color:${p.textColor || '#ffffff'};text-decoration:none;padding:${p.paddingV || 12}px ${p.paddingH || 24}px;border-radius:${p.borderRadius || 4}px;background-color:${p.backgroundColor || '#3b82f6'};">${p.text || 'Clique aqui'}</a>
</td></tr></table></td></tr></table>`
    }
}
