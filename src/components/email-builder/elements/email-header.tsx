"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { PanelTop } from "lucide-react"
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
            style={{ backgroundColor: p.backgroundColor || '#0f172a', padding: `${p.paddingTop ?? 24}px 20px`, textAlign: p.align || 'center' }}
        >
            {p.logoSrc ? (
                <img src={p.logoSrc} alt={p.logoAlt || 'Logo'} style={{ maxWidth: `${p.logoWidth || 150}px`, display: 'inline-block' }} />
            ) : (
                <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
                    {p.brandName || '{{workspace.name}}'}
                </div>
            )}
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
                <Label className="text-xs">URL do logo (opcional)</Label>
                <Input value={p.logoSrc || ''} onChange={e => update('logoSrc', e.target.value)} className="h-8 text-xs mt-1" placeholder="https://..." />
            </div>
            <div>
                <Label className="text-xs">Nome/texto (se sem logo)</Label>
                <Input value={p.brandName || '{{workspace.name}}'} onChange={e => update('brandName', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Largura do logo (px)</Label>
                <Input type="number" value={p.logoWidth || 150} onChange={e => update('logoWidth', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#0f172a'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || '#0f172a'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Alinhamento</Label>
                <Select value={p.align || 'center'} onValueChange={v => update('align', v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs">Padding cima</Label>
                    <Input type="number" value={p.paddingTop ?? 24} onChange={e => update('paddingTop', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                    <Label className="text-xs">Padding baixo</Label>
                    <Input type="number" value={p.paddingBottom ?? 24} onChange={e => update('paddingBottom', Number(e.target.value))} className="h-8 text-xs mt-1" />
                </div>
            </div>
        </div>
    )
}

export const EmailHeaderElement: EmailElementDefinition = {
    type: 'email-header',
    designerBtnElement: { icon: PanelTop, label: 'Cabeçalho', category: 'special' },
    construct: (id) => ({
        id,
        type: 'email-header',
        properties: { logoSrc: '', logoWidth: 150, logoAlt: 'Logo', brandName: '{{workspace.name}}', backgroundColor: '#0f172a', align: 'center', paddingTop: 24, paddingBottom: 24 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const content = p.logoSrc
            ? `<img src="${p.logoSrc}" alt="${p.logoAlt || 'Logo'}" border="0" width="${p.logoWidth || 150}" style="display:inline-block;max-width:${p.logoWidth || 150}px;border:0;" />`
            : `<span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">${p.brandName || '{{workspace.name}}'}</span>`
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || '#0f172a'};"><tr><td align="${p.align || 'center'}" style="padding:${p.paddingTop ?? 24}px 20px ${p.paddingBottom ?? 24}px;">${content}</td></tr></table>`
    }
}
