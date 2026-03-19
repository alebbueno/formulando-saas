"use client"

import React from "react"
import { EmailElementDefinition, EmailElementInstance } from "../types"
import { useEmailBuilder } from "../context/email-builder-context"
import { PanelBottom } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function DesignerComponent({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const p = element.properties
    const isSelected = selectedElement?.id === element.id

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setSelectedElement(element) }}
            className={`cursor-pointer rounded transition-all text-center ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-indigo-200'}`}
            style={{ backgroundColor: p.backgroundColor || '#f8fafc', padding: '24px 20px' }}
        >
            <p style={{ fontSize: `${p.fontSize || 12}px`, color: p.color || '#94a3b8', margin: '0 0 8px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
                {p.companyName || '{{workspace.name}}'} • {p.address || 'Seu endereço aqui'}
            </p>
            <p style={{ fontSize: `${p.fontSize || 12}px`, color: p.color || '#94a3b8', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{p.unsubscribeText || 'Cancelar inscrição'}</span>
                {' • '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Política de Privacidade</span>
            </p>
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
                <Label className="text-xs">Nome da empresa</Label>
                <Input value={p.companyName || '{{workspace.name}}'} onChange={e => update('companyName', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Endereço</Label>
                <Textarea value={p.address || ''} onChange={e => update('address', e.target.value)} className="text-xs mt-1 min-h-[60px]" />
            </div>
            <div>
                <Label className="text-xs">Texto descadastrar</Label>
                <Input value={p.unsubscribeText || 'Cancelar inscrição'} onChange={e => update('unsubscribeText', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">URL descadastrar</Label>
                <Input value={p.unsubscribeUrl || '#unsubscribe'} onChange={e => update('unsubscribeUrl', e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
                <Label className="text-xs">Cor do texto</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.color || '#94a3b8'} onChange={e => update('color', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.color || '#94a3b8'} onChange={e => update('color', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                    <input type="color" value={p.backgroundColor || '#f8fafc'} onChange={e => update('backgroundColor', e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                    <Input value={p.backgroundColor || '#f8fafc'} onChange={e => update('backgroundColor', e.target.value)} className="h-8 text-xs font-mono" />
                </div>
            </div>
            <div>
                <Label className="text-xs">Tamanho fonte (px)</Label>
                <Input type="number" value={p.fontSize || 12} onChange={e => update('fontSize', Number(e.target.value))} className="h-8 text-xs mt-1" />
            </div>
        </div>
    )
}

export const EmailFooterElement: EmailElementDefinition = {
    type: 'email-footer',
    designerBtnElement: { icon: PanelBottom, label: 'Rodapé', category: 'special' },
    construct: (id) => ({
        id,
        type: 'email-footer',
        properties: { companyName: '{{workspace.name}}', address: '', unsubscribeText: 'Cancelar inscrição', unsubscribeUrl: '#unsubscribe', color: '#94a3b8', backgroundColor: '#f8fafc', fontSize: 12 },
    }),
    designerComponent: DesignerComponent,
    propertiesComponent: PropertiesComponent,
    toEmailHtml: (element) => {
        const p = element.properties
        const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif`
        const style = `font-family:${font};font-size:${p.fontSize || 12}px;color:${p.color || '#94a3b8'};margin:0;`
        const address = p.address ? `<br/>${p.address}` : ''
        return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${p.backgroundColor || '#f8fafc'};border-top:1px solid #e2e8f0;"><tr><td align="center" style="padding:24px 20px;">
<p style="${style}margin-bottom:8px;">${p.companyName || '{{workspace.name}}'}${address}</p>
<p style="${style}"><a href="${p.unsubscribeUrl || '#unsubscribe'}" style="color:${p.color || '#94a3b8'};text-decoration:underline;">${p.unsubscribeText || 'Cancelar inscrição'}</a> &bull; <a href="#" style="color:${p.color || '#94a3b8'};text-decoration:underline;">Política de Privacidade</a></p>
</td></tr></table>`
    }
}
