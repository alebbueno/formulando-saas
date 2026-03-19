"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { AlignJustify } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all border border-dashed flex items-center justify-center ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200'}`}
            style={{ height: `${p.height || 24}px`, backgroundColor: p.backgroundColor || 'transparent' }}
        >
            <span className="text-[10px] text-slate-300 pointer-events-none">Espaço {p.height || 24}px</span>
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
                <Label className="text-xs">Altura (px)</Label>
                <Input type="number" value={p.height || 24} onChange={e => update('height', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || 'transparent'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" placeholder="transparent" />
                </div>
            </div>
        </div>
    )
}

export const EmailSpacerElement: EmailElementDefinition = {
    type: 'email-spacer',
    designerBtnElement: { icon: AlignJustify, label: 'Espaço', category: 'layout' },
    construct: (id) => ({
        id,
        type: 'email-spacer',
        properties: { height: 24, backgroundColor: 'transparent' },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td style="height:${p.height || 24}px;font-size:${p.height || 24}px;line-height:${p.height || 24}px;background-color:${p.backgroundColor || 'transparent'};">&nbsp;</td></tr></table>`
    }
}
