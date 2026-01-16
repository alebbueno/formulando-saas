"use client"

import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { useLPBuilder } from "./context/lp-builder-context"
import { LPElementType, LPElement } from "./types"
import { Type, Square, Layout, Image as ImageIcon, FormInput, Columns, LayoutGrid, MousePointer2, Share2, Video, CodeXml, Sparkles } from "lucide-react"
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
    const { addElement, elements, selectedElement } = useLPBuilder()

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
        } else if (type === 'spacer') {
            newElement = {
                id: crypto.randomUUID(),
                type: 'spacer',
                styles: {
                    width: '100%',
                    height: '50px',
                    backgroundColor: 'transparent'
                }
            }
        } else {
            newElement = {
                id: crypto.randomUUID(),
                type: type,
                styles: {
                    width: type === 'container' || type === 'section' ? '100%' : undefined,
                    ...((type === 'container' || type === 'section') && {
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px',
                        minHeight: '150px',
                        backgroundColor: 'transparent'
                    })
                },
                children: []
            }
        }

        // SMART INSERTION: Insert into selected container/section if applicable
        if (selectedElement && (selectedElement.type === 'section' || selectedElement.type === 'container')) {
            // Validation: Prevent section inside container
            if (type === 'section' && selectedElement.type === 'container') {
                console.warn("Cannot place Section inside a Container")
                // TODO: Show toast notification to user
                return
            }

            // Insert inside the selected container as last child
            const childrenCount = selectedElement.children?.length || 0
            addElement(childrenCount, newElement, selectedElement.id)
        } else {
            // Insert at root level (end)
            addElement(elements.length, newElement)
        }
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
                <SidebarDraggableItem type="heading" label="Título" icon={Type} onClick={() => handleQuickInsert('heading')} />
                <SidebarDraggableItem type="text" label="Texto Simples" icon={Type} onClick={() => handleQuickInsert('text')} />
                <SidebarDraggableItem type="rich-text" label="Texto Rico" icon={CodeXml} onClick={() => handleQuickInsert('rich-text')} />
                <SidebarDraggableItem type="image" label="Imagem" icon={ImageIcon} onClick={() => handleQuickInsert('image')} />
                <SidebarDraggableItem type="button" label="Botão" icon={MousePointer2} onClick={() => handleQuickInsert('button')} />
                <SidebarDraggableItem type="social" label="Redes Sociais" icon={Share2} onClick={() => handleQuickInsert('social')} />
                <SidebarDraggableItem type="video" label="Vídeo" icon={Video} onClick={() => handleQuickInsert('video')} />
                <SidebarDraggableItem type="custom-html" label="HTML / Embed" icon={CodeXml} onClick={() => handleQuickInsert('custom-html')} />
                <SidebarDraggableItem type="form" label="Formulário" icon={FormInput} onClick={() => handleQuickInsert('form')} />
                <SidebarDraggableItem type="spacer" label="Espaçamento" icon={Separator} onClick={() => handleQuickInsert('spacer')} />
                <SidebarDraggableItem type="icon" label="Ícone" icon={Sparkles} onClick={() => handleQuickInsert('icon')} />
            </div>
        </div>
    )
}
