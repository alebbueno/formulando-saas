"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Type } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EMAIL_SAFE_FONTS, FONT_WEIGHTS } from "../constants"
import { EmailRichTextEditor } from "../controls/email-rich-text-editor"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement, updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
        >
            <div
                style={{
                    fontFamily: p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                    fontSize: `${p.fontSize || 16}px`,
                    fontWeight: p.fontWeight || 'normal',
                    color: p.color || '#334155',
                    textAlign: p.textAlign || 'left',
                    lineHeight: p.lineHeight || 1.6,
                    letterSpacing: `${p.letterSpacing || 0}px`,
                    paddingTop: `${p.paddingTop ?? 4}px`,
                    paddingBottom: `${p.paddingBottom ?? 4}px`,
                }}
            >
                <EmailRichTextEditor 
                    content={p.text || '<p>Digite seu texto aqui...</p>'}
                    onChange={(html) => updateElementProperties(element.id, { text: html })}
                    editable={isSelected}
                />
            </div>
        </div>
    )
}

function PropertiesComponent({ element }: { element: EmailElementInstance }) {
    const { updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const update = (key: string, value: any) => updateElementProperties(element.id, { [key]: value })

    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content" className="text-xs">Conteúdo</TabsTrigger>
                <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold">Texto / Conteúdo Rico</Label>
                    <p className="text-[10px] text-muted-foreground mb-2">Edite aqui ou diretamente no canvas. O menu de formatação aparece ao selecionar o texto.</p>
                    <div className="min-h-[200px] border rounded-md p-2 bg-white">
                        <EmailRichTextEditor 
                            content={p.text || '<p>Digite seu texto aqui...</p>'}
                            onChange={(html) => updateElementProperties(element.id, { text: html })}
                            editable={true}
                            className="prose-xs"
                        />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
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
                        <Label className="text-xs">Peso (Weight)</Label>
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
                        <Label className="text-xs">Tamanho (px)</Label>
                        <Input type="number" value={p.fontSize || 16} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Espaçamento</Label>
                        <Input type="number" step="0.5" value={p.letterSpacing || 0} onChange={e => update('letterSpacing', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                </div>

                <div>
                    <Label className="text-xs">Cor Base</Label>
                    <div className="flex gap-2 mt-1">
                        <input type="color" value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                        <Input value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                </div>

                <div>
                    <Label className="text-xs">Alinhamento Base</Label>
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

                <div className="grid grid-cols-2 gap-2 border-t pt-4 mt-4">
                    <div>
                        <Label className="text-xs">Padding Cima</Label>
                        <Input type="number" value={p.paddingTop ?? 4} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Padding Baixo</Label>
                        <Input type="number" value={p.paddingBottom ?? 4} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}

export const EmailTextElement: EmailElementDefinition = {
    type: 'email-text',
    designerBtnElement: { icon: Type, label: 'Texto', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-text',
        properties: { 
            text: '<p>Digite seu texto aqui...</p>', 
            fontSize: 16, 
            color: '#334155', 
            textAlign: 'left', 
            fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
            paddingTop: 4,
            paddingBottom: 4,
            lineHeight: 1.6,
            letterSpacing: 0,
            fontWeight: 'normal',
        },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const style = [
            `font-family:${p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'}`,
            `font-size:${p.fontSize || 16}px`,
            `font-weight:${p.fontWeight || 'normal'}`,
            `color:${p.color || '#334155'}`,
            `text-align:${p.textAlign || 'left'}`,
            `line-height:${p.lineHeight || 1.6}`,
            `letter-spacing:${p.letterSpacing || 0}px`,
            `padding-top:${p.paddingTop ?? 4}px`,
            `padding-bottom:${p.paddingBottom ?? 4}px`,
            'margin:0'
        ].join(';')
        
        return `<div style="${style}">${p.text || ''}</div>`
    }
}
