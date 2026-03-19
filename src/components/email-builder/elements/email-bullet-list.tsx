"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id
    const items: string[] = p.items || ['Item 1', 'Item 2', 'Item 3']

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all p-2 ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
        >
            <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                {items.map((item, i) => (
                    <li key={i} style={{ fontSize: `${p.fontSize || 16}px`, color: p.color || '#334155', lineHeight: p.lineHeight || 1.6, marginBottom: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function PropertiesComponent({ element }: { element: EmailElementInstance }) {
    const { updateElementProperties } = useEmailBuilder()
    const p = element.properties
    const items: string[] = p.items || ['Item 1']
    const update = (key: string, value: any) => updateElementProperties(element.id, { [key]: value })

    const updateItem = (index: number, value: string) => {
        const newItems = [...items]
        newItems[index] = value
        update('items', newItems)
    }

    const addItem = () => update('items', [...items, `Item ${items.length + 1}`])
    const removeItem = (index: number) => update('items', items.filter((_, i) => i !== index))

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-xs">Itens da lista</Label>
                <div className="space-y-2 mt-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex gap-1">
                            <Input value={item} onChange={e => updateItem(i, e.target.value)} className="h-7 text-xs" />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeItem(i)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={addItem}>
                        <Plus className="h-3 w-3 mr-1" /> Adicionar item
                    </Button>
                </div>
            </div>
            <div>
                <Label className="text-xs">Tamanho fonte (px)</Label>
                <Input type="number" value={p.fontSize || 16} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.color || '#334155'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
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
        </div>
    )
}

export const EmailBulletListElement: EmailElementDefinition = {
    type: 'email-bullet-list',
    designerBtnElement: { icon: List, label: 'Lista', category: 'content' },
    construct: (id) => ({
        id,
        type: 'email-bullet-list',
        properties: { items: ['Item 1', 'Item 2', 'Item 3'], fontSize: 16, color: '#334155', lineHeight: 1.6, paddingTop: 8, paddingBottom: 8 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const items: string[] = p.items || []
        const itemsHtml = items.map(item =>
            `<li style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:${p.fontSize || 16}px;color:${p.color || '#334155'};line-height:${p.lineHeight || 1.6};margin-bottom:4px;">${item}</li>`
        ).join('\n')
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td style="padding:${p.paddingTop ?? 8}px 0 ${p.paddingBottom ?? 8}px;"><ul style="margin:0;padding:0 0 0 20px;">${itemsHtml}</ul></td></tr></table>`
    }
}
