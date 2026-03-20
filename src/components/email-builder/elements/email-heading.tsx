"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Heading1 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EMAIL_SAFE_FONTS, FONT_WEIGHTS } from "../constants"
import { EmailMergeTagSelector } from "../controls/email-merge-tag-selector"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement, updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id
    const Tag = (p.level || 'h2') as any

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
        >
            <Tag
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => updateElementProperties(element.id, { text: e.currentTarget.innerText })}
                style={{
                    fontSize: `${p.fontSize || 28}px`,
                    fontWeight: p.fontWeight || 'bold',
                    color: p.color || '#0f172a',
                    textAlign: p.textAlign || 'left',
                    margin: 0,
                    padding: `${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px`,
                    fontFamily: p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                    outline: 'none',
                    lineHeight: p.lineHeight || 1.3,
                }}
            >
                {p.text || 'Título do email'}
            </Tag>
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
                    <Label className="text-xs font-semibold">Texto do Título</Label>
                    <div className="flex gap-1 mt-1">
                        <Input value={p.text || ''} onChange={e => update('text', e.target.value)} className="h-8 text-xs" />
                        <EmailMergeTagSelector onSelect={tag => update('text', (p.text || '') + tag)} />
                    </div>
                </div>
                <div>
                    <Label className="text-xs font-semibold">Nível do Título</Label>
                    <Select value={p.level || 'h2'} onValueChange={v => update('level', v)}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="h1">H1 (Principal)</SelectItem>
                            <SelectItem value="h2">H2 (Subtítulo)</SelectItem>
                            <SelectItem value="h3">H3 (Menor)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs font-semibold">Fonte</Label>
                        <Select value={p.fontFamily || 'Arial, "Helvetica Neue", Helvetica, sans-serif'} onValueChange={v => update('fontFamily', v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent className="w-[180px]">
                                {EMAIL_SAFE_FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold">Peso</Label>
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
                        <Label className="text-xs font-semibold">Tamanho (px)</Label>
                        <Input type="number" value={p.fontSize || 28} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold">Alinhamento</Label>
                        <Select value={p.textAlign || 'left'} onValueChange={v => update('textAlign', v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label className="text-xs font-semibold">Cor</Label>
                    <div className="flex gap-2 mt-1">
                        <input type="color" value={p.color || '#0f172a'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                        <Input value={p.color || '#0f172a'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-4 mt-2">
                    <div>
                        <Label className="text-xs font-semibold">Padding Cima</Label>
                        <Input type="number" value={p.paddingTop ?? 8} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold">Padding Baixo</Label>
                        <Input type="number" value={p.paddingBottom ?? 8} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}

export const EmailHeadingElement: EmailElementDefinition = {
    type: 'email-heading',
    designerBtnElement: { icon: Heading1, label: 'Título', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-heading',
        properties: { text: 'Título do email', level: 'h2', fontSize: 28, fontWeight: 'bold', color: '#0f172a', textAlign: 'left', paddingTop: 8, paddingBottom: 8, lineHeight: 1.3, fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const tag = p.level || 'h2'
        const style = [
            `font-family:${p.fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'}`,
            `font-size:${p.fontSize || 28}px`,
            `font-weight:${p.fontWeight || 'bold'}`,
            `color:${p.color || '#0f172a'}`,
            `text-align:${p.textAlign || 'left'}`,
            `padding:${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px`,
            `line-height:${p.lineHeight || 1.3}`,
            'margin:0'
        ].join(';')
        return `<${tag} style="${style}">${p.text || ''}</${tag}>`
    }
}
