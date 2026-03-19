"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ padding: `${p.paddingTop ?? 16}px 0 ${p.paddingBottom ?? 16}px` }}
        >
            <hr style={{ border: 'none', borderTop: `${p.thickness || 1}px ${p.style || 'solid'} ${p.color || '#e2e8f0'}`, margin: 0 }} />
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
                <Label className="text-xs">Cor</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.color || '#e2e8f0'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.color || '#e2e8f0'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Espessura (px)</Label>
                <Input type="number" value={p.thickness || 1} onChange={e => update('thickness', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Estilo</Label>
                <Select value={p.style || 'solid'} onValueChange={v => update('style', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="solid">Sólido</SelectItem>
                        <SelectItem value="dashed">Tracejado</SelectItem>
                        <SelectItem value="dotted">Pontilhado</SelectItem>
                    </SelectContent>
                </Select>
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
            </div>
        </div>
    )
}

export const EmailDividerElement: EmailElementDefinition = {
    type: 'email-divider',
    designerBtnElement: { icon: Minus, label: 'Divisor', category: 'layout' },
    construct: (id) => ({
        id,
        type: 'email-divider',
        properties: { color: '#e2e8f0', thickness: 1, style: 'solid', paddingTop: 16, paddingBottom: 16 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td style="padding:${p.paddingTop ?? 16}px 0 ${p.paddingBottom ?? 16}px;"><hr style="border:none;border-top:${p.thickness || 1}px ${p.style || 'solid'} ${p.color || '#e2e8f0'};margin:0;" /></td></tr></table>`
    }
}
