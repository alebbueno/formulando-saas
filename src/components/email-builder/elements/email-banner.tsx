"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Megaphone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement, updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ backgroundColor: p.backgroundColor || '#3b82f6', padding: `${p.paddingTop ?? 40}px 20px ${p.paddingBottom ?? 40}px`, textAlign: p.textAlign || 'center' }}
        >
            <p
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => updateElementProperties(element.id, { text: e.currentTarget.innerText })}
                style={{ fontSize: `${p.fontSize || 32}px`, fontWeight: 'bold', color: p.textColor || '#ffffff', margin: '0 0 8px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', outline: 'none' }}
            >
                {p.text || 'Título do banner'}
            </p>
            {p.subtext && (
                <p style={{ fontSize: `${p.subtextFontSize || 16}px`, color: p.textColor || '#ffffff', margin: 0, opacity: 0.85, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
                    {p.subtext}
                </p>
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
                <Label className="text-xs">Título</Label>
                <Input value={p.text || ''} onChange={e => update('text', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Subtítulo</Label>
                <Input value={p.subtext || ''} onChange={e => update('subtext', e.target.value)} className="h-8 text-xs mt-1" />
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
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Fonte título (px)</Label>
                    <Input type="number" value={p.fontSize || 32} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Fonte subtítulo (px)</Label>
                    <Input type="number" value={p.subtextFontSize || 16} onChange={e => update('subtextFontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Alinhamento</Label>
                <Select value={p.textAlign || 'center'} onValueChange={v => update('textAlign', v)}>
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
                    <Input type="number" value={p.paddingTop ?? 40} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding baixo</Label>
                    <Input type="number" value={p.paddingBottom ?? 40} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
    )
}

export const EmailBannerElement: EmailElementDefinition = {
    type: 'email-banner',
    designerBtnElement: { icon: Megaphone, label: 'Banner', category: 'special' },
    construct: (id) => ({
        id,
        type: 'email-banner',
        properties: { text: 'Título do banner', subtext: 'Subtítulo opcional', backgroundColor: '#3b82f6', textColor: '#ffffff', fontSize: 32, subtextFontSize: 16, textAlign: 'center', paddingTop: 40, paddingBottom: 40 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif`
        const subHtml = p.subtext ? `<p style="font-family:${font};font-size:${p.subtextFontSize || 16}px;color:${p.textColor || '#ffffff'};margin:8px 0 0;opacity:0.85;">${p.subtext}</p>` : ''
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || '#3b82f6'};"><tr><td align="${p.textAlign || 'center'}" style="padding:${p.paddingTop ?? 40}px 20px ${p.paddingBottom ?? 40}px;">
<p style="font-family:${font};font-size:${p.fontSize || 32}px;font-weight:bold;color:${p.textColor || '#ffffff'};margin:0;">${p.text || ''}</p>
${subHtml}</td></tr></table>`
    }
}
