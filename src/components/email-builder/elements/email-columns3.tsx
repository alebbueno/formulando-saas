"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { LayoutGrid } from "lucide-react"
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
            className={`relative cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ backgroundColor: p.backgroundColor || 'transparent', padding: `${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px` }}
        >
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border border-dashed border-slate-300 rounded bg-slate-50/50 flex items-center justify-center text-xs text-slate-400 py-4 flex-1">
                        Col {i}
                    </div>
                ))}
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
                    <Label className="text-xs font-semibold">Espaço entre colunas (px)</Label>
                    <Input type="number" value={p.gap || 16} onChange={e => update('gap', Number(e.target.value))} className="h-8 text-xs mt-1" />
                    <p className="text-[10px] text-slate-400 mt-1">As 3 colunas possuem larguras iguais (33% cada).</p>
                </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold">Cor de Fundo</Label>
                    <div className="flex gap-2 mt-1">
                        <input type="color" value={p.backgroundColor === 'transparent' ? '#ffffff' : (p.backgroundColor || '#ffffff')} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer shrink-0" />
                        <Input value={p.backgroundColor || 'transparent'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-4">
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

export const EmailColumns3Element: EmailElementDefinition = {
    type: 'email-columns3',
    designerBtnElement: { icon: LayoutGrid, label: '3 Colunas', category: 'layout' },
    construct: (id) => ({
        id,
        type: 'email-columns3',
        properties: { gap: 16, backgroundColor: 'transparent', paddingTop: 8, paddingBottom: 8, columns: [[], [], []] },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const thirdW = 33
        const halfGap = Math.floor((p.gap || 16) / 2)
        const colHtmls: string[] = (element as any)._colHtmls || ['', '', '']
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || 'transparent'};"><tr><td style="padding:${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr>
<td class="mobile-stack" valign="top" style="width:${thirdW}%;padding-right:${halfGap}px;">${colHtmls[0]}</td>
<td class="mobile-stack" valign="top" style="width:${thirdW}%;padding:0 ${halfGap}px;">${colHtmls[1]}</td>
<td class="mobile-stack" valign="top" style="width:${thirdW}%;padding-left:${halfGap}px;">${colHtmls[2]}</td>
</tr></table></td></tr></table>`
    }
}
