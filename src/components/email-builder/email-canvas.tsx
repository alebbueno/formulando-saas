"use client"

import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEmailBuilder } from "./context/email-builder-context"
import { EmailCanvasElement } from "./email-canvas-element"
import { cn } from "@/lib/utils"
import { Mail } from "lucide-react"

export function EmailCanvas() {
    const { elements, previewDevice, setSelectedElement } = useEmailBuilder()

    const { isOver, setNodeRef } = useDroppable({
        id: "email-canvas-droppable",
        data: { isCanvas: true },
    })

    const canvasWidth = previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[620px]'

    return (
        <div
            className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center"
            onClick={() => setSelectedElement(null)}
        >
            <div className={cn("w-full", canvasWidth)}>
                {/* Device indicator */}
                <div className="flex justify-center mb-3">
                    <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border">
                        {previewDevice === 'mobile' ? '📱 Mobile (375px)' : '🖥️ Desktop (600px)'}
                    </span>
                </div>

                {/* Email canvas */}
                <div
                    ref={setNodeRef}
                    className={cn(
                        "bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[600px] transition-all",
                        isOver && "ring-2 ring-indigo-300 bg-indigo-50/20"
                    )}
                >
                    {elements.length === 0 && !isOver ? (
                        <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
                            <Mail className="h-12 w-12 mb-4 opacity-30" />
                            <p className="text-sm font-medium">Arraste componentes aqui</p>
                            <p className="text-xs mt-1 opacity-70">ou clique nos itens da paleta</p>
                        </div>
                    ) : (
                        <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col divide-y divide-transparent p-2 gap-1">
                                {elements.map(element => (
                                    <EmailCanvasElement key={element.id} element={element} />
                                ))}
                            </div>
                        </SortableContext>
                    )}
                </div>
            </div>
        </div>
    )
}
