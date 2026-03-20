"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { AlignLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EMAIL_SAFE_FONTS, FONT_WEIGHTS } from "../constants"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement, updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
        >
            <p
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => updateElementProperties(element.id, { text: e.currentTarget.innerText })}
                style={{
                    fontSize: `${p.fontSize || 16}px`,
                    color: p.color || '#334155',
                    textAlign: p.textAlign || 'left',
                    lineHeight: p.lineHeight || 1.6,
                    margin: 0,
                    padding: `${p.paddingTop ?? 4}px 0 ${p.paddingBottom ?? 4}px`,
                    fontFamily: p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                    fontWeight: p.fontWeight || 'normal',
                    letterSpacing: `${p.letterSpacing || 0}px`,
                    outline: 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}
            >
                {p.text || 'Digite seu texto aqui...'}
            </p>
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
                <Label className="text-xs">Texto (suporta merge tags)</Label>
                <Textarea value={p.text || ''} onChange={e => update('text', e.target.value)} className="text-xs mt-1 min-h-[100px]" />
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
                    <Label className="text-xs">Peso (Font Weight)</Label>
                    <Select value={p.fontWeight || 'normal'} onValueChange={v => update('fontWeight', v)}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {FONT_WEIGHTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Tamanho da fonte (px)</Label>
                    <Input type="number" value={p.fontSize || 16} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Espaçamento letras</Label>
                    <Input type="number" step="0.5" value={p.letterSpacing || 0} onChange={e => update('letterSpacing', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Cor</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Alinhamento</Label>
                <Select value={p.textAlign || 'left'} onValueChange={v => update('textAlign', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Altura da linha</Label>
                <Input type="number" step="0.1" value={p.lineHeight || 1.6} onChange={e => update('lineHeight', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Padding cima</Label>
                    <Input type="number" value={p.paddingTop ?? 4} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding baixo</Label>
                    <Input type="number" value={p.paddingBottom ?? 4} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
    )
}

export const EmailTextElement: EmailElementDefinition = {
    type: 'email-text',
    designerBtnElement: { icon: AlignLeft, label: 'Texto', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-text',
        properties: { 
            text: 'Digite seu texto aqui...', 
            fontSize: 16, 
            color: '#334155', 
            textAlign: 'left', 
            lineHeight: 1.6, 
            paddingTop: 4, 
            paddingBottom: 4,
            fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontWeight: 'normal',
            letterSpacing: 0
        },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const text = (p.text || '').replace(/\n/g, '<br/>')
        const style = [
            `font-family:${p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif'}`,
            `font-size:${p.fontSize || 16}px`,
            `font-weight:${p.fontWeight || 'normal'}`,
            `color:${p.color || '#334155'}`,
            `text-align:${p.textAlign || 'left'}`,
            `line-height:${p.lineHeight || 1.6}`,
            `letter-spacing:${p.letterSpacing || 0}px`,
            `margin:0`,
            `padding:${p.paddingTop ?? 4}px 0 ${p.paddingBottom ?? 4}px`,
            `word-break:break-word`,
        ].join(';')
        return `<p style="${style}">${text}</p>`
    }
}
