"use client"

import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { useEmailBuilder } from "./context/email-builder-context"
import { EmailElements } from "./elements"
import { EmailElementType, EmailElementInstance } from "./types"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function SidebarDraggableItem({ type, label, icon: Icon }: { type: EmailElementType; label: string; icon: React.ElementType }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-draggable-${type}`,
        data: { type, fromSidebar: true },
    })

    const { addElement, elements } = useEmailBuilder()

    const handleClick = () => {
        const def = EmailElements[type]
        if (!def) return
        const newEl = def.construct(crypto.randomUUID())
        addElement(elements.length, newEl)
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={cn(
                "flex flex-col items-center justify-center p-3 border rounded-lg bg-white hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer select-none",
                isDragging && "opacity-40 scale-95"
            )}
        >
            <Icon className="h-5 w-5 mb-1.5 text-slate-500" />
            <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{label}</span>
        </div>
    )
}

const CATEGORY_LABELS: Record<string, string> = {
    layout: 'Layout',
    content: 'Conteúdo',
    special: 'Especiais',
}

export function EmailSidebarLeft() {
    const layoutElements = Object.values(EmailElements).filter(e => e.designerBtnElement.category === 'layout')
    const contentElements = Object.values(EmailElements).filter(e => e.designerBtnElement.category === 'content')
    const specialElements = Object.values(EmailElements).filter(e => e.designerBtnElement.category === 'special')

    const categories = [
        { key: 'layout', label: CATEGORY_LABELS.layout, items: layoutElements },
        { key: 'content', label: CATEGORY_LABELS.content, items: contentElements },
        { key: 'special', label: CATEGORY_LABELS.special, items: specialElements },
    ]

    return (
        <div className="w-56 border-r bg-slate-50/50 p-3 h-full overflow-y-auto flex flex-col gap-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Componentes</div>
            {categories.map(({ key, label, items }) => (
                <div key={key}>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">{label}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {items.map(el => (
                            <SidebarDraggableItem
                                key={el.type}
                                type={el.type}
                                label={el.designerBtnElement.label}
                                icon={el.designerBtnElement.icon}
                            />
                        ))}
                    </div>
                    <Separator className="mt-3" />
                </div>
            ))}
        </div>
    )
}
