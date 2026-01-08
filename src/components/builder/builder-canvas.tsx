"use client"

import { useBuilder } from "@/context/builder-context"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { FormElements } from "./form-elements"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles, DragDrop } from "lucide-react"

interface BuilderCanvasProps {
    onOpenTemplates?: () => void
    onOpenAIChat?: () => void
}

export function BuilderCanvas({ onOpenTemplates, onOpenAIChat }: BuilderCanvasProps) {
    const { elements, selectedElement, setSelectedElement } = useBuilder()

    const { setNodeRef, isOver } = useDroppable({
        id: "designer-drop-area",
        data: {
            isDesignerDropArea: true,
        },
    })


    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 w-full bg-accent/30 rounded-xl m-4 p-4 overflow-y-auto h-full flex flex-col items-center justify-start transition-all",
                isOver && "ring-2 ring-primary/50 bg-accent/50"
            )}
        >
            {!elements.length && (
                <div className="flex flex-col items-center justify-center h-full w-full gap-8">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <DragDrop className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">
                                Comece criando seu formulário
                            </h3>
                            <p className="text-muted-foreground">
                                Arraste componentes da barra lateral ou use uma das opções abaixo para começar rapidamente
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        {onOpenTemplates && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={onOpenTemplates}
                            >
                                <FileText className="h-8 w-8 text-primary" />
                                <span className="font-semibold">Usar Template</span>
                                <span className="text-xs text-muted-foreground">Escolha um template pronto</span>
                            </Button>
                        )}
                        {onOpenAIChat && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={onOpenAIChat}
                            >
                                <Sparkles className="h-8 w-8 text-primary" />
                                <span className="font-semibold">Gerar com IA</span>
                                <span className="text-xs text-muted-foreground">Crie automaticamente</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {elements.length > 0 && (
                <div className="flex flex-col w-full gap-2 p-4 max-w-[900px]">
                    <SortableContext items={elements} strategy={verticalListSortingStrategy}>
                        {elements.map(element => (
                            <SortableElement key={element.id} element={element} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    )
}

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

function SortableElement({ element }: { element: any }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        }
    })

    const { selectedElement, setSelectedElement, removeElement } = useBuilder()
    const DesignerElement = FormElements[element.type as keyof typeof FormElements].designerComponent
    const isSelected = selectedElement?.id === element.id

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const handleDelete = () => {
        removeElement(element.id)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "p-4 border rounded-md bg-background relative flex items-center justify-center cursor-pointer hover:border-primary/50 group",
                isSelected && "border-primary ring-1 ring-primary",
                isDragging && "opacity-50"
            )}
            onClick={(e) => {
                e.stopPropagation()
                setSelectedElement(element)
            }}
        >
            {/* Delete Button - Absolute positioned, visible on hover or selection */}
            <div className={cn(
                "absolute -top-2 -right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected && "opacity-100" // Always show if selected
            )}>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-md"
                            onClick={(e) => {
                                // Prevent selecting the element when clicking delete?
                                // Actually trigger handles click. But we need to stop propagation to prevent selection change?
                                // Trigger's onClick will fire.
                                // We might need to stop propagation on the trigger wrapper or button.
                                // e.stopPropagation()
                            }}
                            onPointerDown={(e) => e.stopPropagation()} // Important for DnD to not drag
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente este componente do formulário.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete()
                                }}
                            >
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <DesignerElement elementInstance={element} />
        </div>
    )
}
