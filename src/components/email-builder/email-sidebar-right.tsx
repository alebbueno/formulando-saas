"use client"

import React from "react"
import { useEmailBuilder } from "./context/email-builder-context"
import { EmailElements } from "./elements"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function EmailSidebarRight() {
    const { selectedElement, setSelectedElement, removeElement } = useEmailBuilder()

    if (!selectedElement) {
        return (
            <div className="w-64 border-l bg-white p-4 h-full overflow-y-auto">
                <div className="text-xs font-semibold uppercase text-slate-500 mb-4">Propriedades</div>
                <div className="text-xs text-slate-400 text-center mt-10">
                    Selecione um elemento para editar suas propriedades
                </div>
            </div>
        )
    }

    const def = EmailElements[selectedElement.type]
    if (!def) return null

    const PropertiesComponent = def.propertiesComponent

    return (
        <div className="w-64 border-l bg-white h-full overflow-y-auto flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
                <div>
                    <div className="text-xs font-semibold text-slate-700">{def.designerBtnElement.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{selectedElement.type}</div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                    onClick={() => { removeElement(selectedElement.id); setSelectedElement(null) }}
                    title="Deletar elemento"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <PropertiesComponent element={selectedElement} />
            </div>
        </div>
    )
}
