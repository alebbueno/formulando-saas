"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Quote } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EMAIL_SAFE_FONTS } from "../constants"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement, updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ backgroundColor: p.backgroundColor || '#f8fafc', borderLeft: `4px solid ${p.borderColor || '#3b82f6'}`, padding: '16px 20px', margin: '0' }}
        >
            <p
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => updateElementProperties(element.id, { text: e.currentTarget.innerText })}
                style={{ fontSize: `${p.fontSize || 18}px`, color: p.textColor || '#334155', fontStyle: p.fontStyle || 'italic', margin: '0 0 8px', fontFamily: p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif', outline: 'none', lineHeight: 1.6 }}
            >
                {p.text || '"Citação inspiradora aqui"'}
            </p>
            {p.author && (
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontFamily: p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif' }}>
                    — {p.author}
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
                <Label className="text-xs">Texto da citação</Label>
                <Textarea value={p.text || ''} onChange={e => update('text', e.target.value)} className="text-xs mt-1 min-h-[80px]" />
            </div>
            <div>
                <Label className="text-xs">Autor (opcional)</Label>
                <Input value={p.author || ''} onChange={e => update('author', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor da borda</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.borderColor || '#3b82f6'} onChange={e => update('borderColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.borderColor || '#3b82f6'} onChange={e => update('borderColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#f8fafc'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || '#f8fafc'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Cor do texto</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.textColor || '#334155'} onChange={e => update('textColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.textColor || '#334155'} onChange={e => update('textColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Fonte</Label>
                <Select value={p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'} onValueChange={v => update('fontFamily', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {EMAIL_SAFE_FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Estilo da fonte</Label>
                <Select value={p.fontStyle || 'italic'} onValueChange={v => update('fontStyle', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="italic">Itálico</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Tamanho fonte (px)</Label>
                <Input type="number" value={p.fontSize || 18} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
        </div>
    )
}

export const EmailQuoteElement: EmailElementDefinition = {
    type: 'email-quote',
    designerBtnElement: { icon: Quote, label: 'Citação', category: 'special' },
    construct: (id) => ({
        id,
        type: 'email-quote',
        properties: { text: '"Citação inspiradora aqui"', author: '', borderColor: '#3b82f6', backgroundColor: '#f8fafc', textColor: '#334155', fontStyle: 'italic', fontSize: 18, fontFamily: 'Arial, \"Helvetica Neue\", Helvetica, sans-serif' },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const font = p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'
        const authorHtml = p.author ? `<p style="font-family:${font};font-size:14px;color:#64748b;margin:8px 0 0;">— ${p.author}</p>` : ''
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td style="padding:8px 0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || '#f8fafc'};border-left:4px solid ${p.borderColor || '#3b82f6'};"><tr><td style="padding:16px 20px;">
<p style="font-family:${font};font-size:${p.fontSize || 18}px;color:${p.textColor || '#334155'};font-style:${p.fontStyle || 'italic'};margin:0;line-height:1.6;">${p.text || ''}</p>
${authorHtml}</td></tr></table></td></tr></table>`
    }
}
