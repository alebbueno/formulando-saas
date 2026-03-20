"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { LayoutTemplate } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative min-h-[80px] border-2 border-dashed rounded transition-all cursor-pointer ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 bg-white hover:border-indigo-300'}`}
            style={{ backgroundColor: p.backgroundColor || 'transparent', padding: `${p.paddingTop ?? 16}px ${p.paddingRight ?? 0}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 0}px` }}
        >
            <div className="text-xs text-slate-400 text-center py-2 uppercase tracking-wider font-medium opacity-50">Seção — arraste elementos aqui</div>
        </div>
    )
}

function PropertiesComponent({ element }: { element: EmailElementInstance }) {
    const { updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const update = (key: string, value: any) => updateElementProperties(element.id, { [key]: value })

    return (
        <Tabs defaultValue="style" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content" className="text-xs" disabled>Conteúdo</TabsTrigger>
                <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
                <p className="text-xs text-slate-500 text-center py-4">Seções não possuem conteúdo editável diretamente. Arraste outros elementos para dentro delas no canvas.</p>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold">Cor de Fundo</Label>
                    <div className="flex gap-2 mt-1">
                        <input type="color" value={p.backgroundColor === 'transparent' ? '#ffffff' : (p.backgroundColor || '#ffffff')} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer shrink-0" />
                        <Input value={p.backgroundColor || 'transparent'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                </div>
                
                <div className="border-t pt-4">
                    <Label className="text-xs font-semibold mb-2 block">Paddings (px)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-[10px] text-slate-500">Cima</Label>
                            <Input type="number" value={p.paddingTop ?? 16} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                        </div>
                        <div>
                            <Label className="text-[10px] text-slate-500">Baixo</Label>
                            <Input type="number" value={p.paddingBottom ?? 16} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                        </div>
                        <div>
                            <Label className="text-[10px] text-slate-500">Esquerda</Label>
                            <Input type="number" value={p.paddingLeft ?? 0} onChange={e => update('paddingLeft', Number(e.target.value))} className="h-8 text-xs mt-1" />
                        </div>
                        <div>
                            <Label className="text-[10px] text-slate-500">Direita</Label>
                            <Input type="number" value={p.paddingRight ?? 0} onChange={e => update('paddingRight', Number(e.target.value))} className="h-8 text-xs mt-1" />
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}

export const EmailSectionElement: EmailElementDefinition = {
    type: 'email-section',
    designerBtnElement: { icon: LayoutTemplate, label: 'Seção', category: 'layout' },
    construct: (id) => ({
        id,
        type: 'email-section',
        properties: { backgroundColor: 'transparent', paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
        children: [],
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const childrenHtml = (element as any)._childrenHtml || ''
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || 'transparent'};"><tr><td style="padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 0}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 0}px;">${childrenHtml}</td></tr></table>`
    }
}
