"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { LayoutTemplate } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
            <div className="text-xs text-slate-400 text-center py-2">Seção — arraste elementos aqui</div>
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
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Padding cima</Label>
                    <Input type="number" value={p.paddingTop ?? 16} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding baixo</Label>
                    <Input type="number" value={p.paddingBottom ?? 16} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding esq</Label>
                    <Input type="number" value={p.paddingLeft ?? 0} onChange={e => update('paddingLeft', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding dir</Label>
                    <Input type="number" value={p.paddingRight ?? 0} onChange={e => update('paddingRight', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
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
        // Children are rendered by html-export.ts via renderElement (recursive)
        const childrenHtml = (element as any)._childrenHtml || ''
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || 'transparent'};"><tr><td style="padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 0}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 0}px;">${childrenHtml}</td></tr></table>`
    }
}
