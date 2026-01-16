"use client"

import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { useLPBuilder } from "./context/lp-builder-context"
import { LPElementType, LPElement } from "./types"
import { Type, Square, Layout, Image as ImageIcon, FormInput, Columns, LayoutGrid, MousePointer2, Share2, Video, CodeXml } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function SidebarDraggableItem({ type, label, icon: Icon, onClick }: { type: LPElementType, label: string, icon: React.ElementType, onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-draggable-${type}`,
        data: {
            type,
            fromSidebar: true,
        }
    })

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-md bg-white hover:border-primary hover:shadow-sm transition-all",
                onClick ? "cursor-pointer" : "cursor-move",
                isDragging && "opacity-50"
            )}
        >
            <Icon className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}

export function SidebarLeft() {
    const { addElement, elements } = useLPBuilder()

    const handleQuickInsert = (type: LPElementType) => {
        let newElement: LPElement

        if (type === '2-col') {
            newElement = {
                id: crypto.randomUUID(),
                type: 'container',
                styles: {
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    gap: '20px',
                    padding: '20px'
                },
                children: [
                    {
                        id: crypto.randomUUID(),
                        type: 'container',
                        styles: { flex: '1', minHeight: '100px', border: '1px dashed #ccc', padding: '10px' },
                        children: []
                    },
                    {
                        id: crypto.randomUUID(),
                        type: 'container',
                        styles: { flex: '1', minHeight: '100px', border: '1px dashed #ccc', padding: '10px' },
                        children: []
                    }
                ]
            }
        } else if (type === '3-col') {
            newElement = {
                id: crypto.randomUUID(),
                type: 'container',
                styles: {
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    gap: '20px',
                    padding: '20px'
                },
                children: [
                    { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', border: '1px dashed #ccc', padding: '10px' }, children: [] },
                    { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', border: '1px dashed #ccc', padding: '10px' }, children: [] },
                    { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', border: '1px dashed #ccc', padding: '10px' }, children: [] }
                ]
            }
        } else {
            newElement = {
                id: crypto.randomUUID(),
                type: type,
                styles: {
                    width: type === 'container' || type === 'section' ? '100%' : undefined,
                    ...((type === 'container' || type === 'section') && { display: 'flex', flexDirection: 'column', padding: '20px', minHeight: '150px' })
                },
                children: []
            }
        }

        // Insert at the end
        addElement(elements.length, newElement)
    }

    return (
        <div className="w-64 border-r bg-muted/10 p-4 h-full overflow-y-auto">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-4">Estrutura</div>
            <div className="grid grid-cols-2 gap-2 mb-6">
                <SidebarDraggableItem type="section" label="Seção" icon={Layout} onClick={() => handleQuickInsert('section')} />
                <SidebarDraggableItem type="container" icon={Square} label="Container" onClick={() => handleQuickInsert('container')} />
                <SidebarDraggableItem type="2-col" icon={Columns} label="2 Colunas" onClick={() => handleQuickInsert('2-col')} />
                <SidebarDraggableItem type="3-col" icon={LayoutGrid} label="3 Colunas" onClick={() => handleQuickInsert('3-col')} />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Elementos</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <SidebarDraggableItem type="heading" label="Título" icon={Type} />
                <SidebarDraggableItem type="text" label="Texto Simples" icon={Type} />
                <SidebarDraggableItem type="rich-text" label="Texto Rico" icon={CodeXml} />
                <SidebarDraggableItem type="image" label="Imagem" icon={ImageIcon} />
                <SidebarDraggableItem type="button" label="Botão" icon={MousePointer2} />
                <SidebarDraggableItem type="social" label="Redes Sociais" icon={Share2} />
                <SidebarDraggableItem type="video" label="Vídeo" icon={Video} />
                <SidebarDraggableItem type="custom-html" label="HTML / Embed" icon={CodeXml} />
                <SidebarDraggableItem type="form" label="Formulário" icon={FormInput} />
            </div>
        </div>
    )
}
