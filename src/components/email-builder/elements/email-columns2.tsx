"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Columns2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id
    const col1W = p.column1Width ?? 50
    const col2W = 100 - col1W

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`relative cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ backgroundColor: p.backgroundColor || 'transparent', padding: `${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px` }}
        >
            <div className="flex gap-2">
                <div className="border border-dashed border-slate-300 rounded bg-slate-50/50 flex items-center justify-center text-xs text-slate-400 py-4" style={{ flex: col1W }}>
                    Coluna 1 ({col1W}%)
                </div>
                <div className="border border-dashed border-slate-300 rounded bg-slate-50/50 flex items-center justify-center text-xs text-slate-400 py-4" style={{ flex: col2W }}>
                    Coluna 2 ({col2W}%)
                </div>
            </div>
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
                <Label className="text-xs">Largura coluna 1 (%)</Label>
                <Input type="number" min={10} max={90} value={p.column1Width ?? 50} onChange={e => update('column1Width', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Espaço entre colunas (px)</Label>
                <Input type="number" value={p.gap || 20} onChange={e => update('gap', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || 'transparent'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
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
            <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">Para adicionar conteúdo nas colunas, use o modo HTML ou adicione blocos inline na coluna desejada.</p>
        </div>
    )
}

export const EmailColumns2Element: EmailElementDefinition = {
    type: 'email-columns2',
    designerBtnElement: { icon: Columns2, label: '2 Colunas', category: 'layout' },
    construct: (id) => ({
        id,
        type: 'email-columns2',
        properties: { column1Width: 50, gap: 20, backgroundColor: 'transparent', paddingTop: 8, paddingBottom: 8, columns: [[], []] },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const col1W = p.column1Width ?? 50
        const col2W = 100 - col1W
        const halfGap = Math.floor((p.gap || 20) / 2)
        // Children are rendered by html-export.ts via renderElement (recursive)
        const colHtmls: string[] = (element as any)._colHtmls || ['', '']
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || 'transparent'};"><tr><td style="padding:${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr>
<td class="mobile-stack" valign="top" style="width:${col1W}%;padding-right:${halfGap}px;">${colHtmls[0]}</td>
<td class="mobile-stack" valign="top" style="width:${col2W}%;padding-left:${halfGap}px;">${colHtmls[1]}</td>
</tr></table></td></tr></table>`
    }
}
