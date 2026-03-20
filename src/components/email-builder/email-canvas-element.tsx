"use client"

import React from "react"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { EmailElementInstance, EmailElementType } from "./types"
import { EmailElements } from "./elements"
import { useEmailBuilder } from "./context/email-builder-context"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Copy, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Drop zone ID prefixes ─────────────────────────────────────────────────────
export const INTO_PREFIX = 'into:'          // section drop zone: into:{parentId}
export const COL_PREFIX  = 'col:'           // column drop zone:  col:{parentId}:{colIndex}

export const CONTAINER_TYPES: EmailElementType[] = ['email-section']
export const COLUMN_TYPES: EmailElementType[]    = ['email-columns2', 'email-columns3']

// ── Section drop zone (at bottom of section) ─────────────────────────────────
function SectionDropZone({ parentId }: { parentId: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `${INTO_PREFIX}${parentId}`,
        data: { isEmailContainer: true, elementId: parentId },
    })
    return (
        <div ref={setNodeRef} className={cn(
            "mt-1 h-8 rounded border-2 border-dashed flex items-center justify-center transition-all text-[10px] select-none",
            isOver ? "border-indigo-400 bg-indigo-50 text-indigo-500 font-medium" : "border-slate-200 text-slate-300"
        )}>
            {isOver ? "Solte aqui" : "+ Arraste aqui"}
        </div>
    )
}


// ── Toolbar ───────────────────────────────────────────────────────────────────
function ElementToolbar({ element, dragHandleProps }: { element: EmailElementInstance, dragHandleProps?: any }) {
    const { removeElement, moveElementDirection, duplicateElement, setSelectedElement } = useEmailBuilder()
    return (
        <div
            className="absolute -top-9 right-0 h-8 bg-white border shadow-md rounded-md flex items-center gap-0.5 px-1 z-50 animate-in fade-in zoom-in-95 duration-100"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            <div 
                {...dragHandleProps}
                className="flex items-center px-1 cursor-grab active:cursor-grabbing hover:bg-slate-50 rounded h-6"
                title="Arraste para mover"
            >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="w-px h-3 bg-border mx-0.5" />
            <div className="flex items-center px-1 text-[10px] font-mono text-muted-foreground border-r mr-1 select-none">
                {element.type.replace('email-', '')}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveElementDirection(element.id, 'up')}><ChevronUp className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveElementDirection(element.id, 'down')}><ChevronDown className="h-3 w-3" /></Button>
            <div className="w-px h-3 bg-border mx-0.5" />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => duplicateElement(element.id)}><Copy className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => { removeElement(element.id); setSelectedElement(null) }}><Trash2 className="h-3 w-3" /></Button>
        </div>
    )
}

// ── Single column renderer (entire area is a drop zone) ──────────────────────
function ColumnRenderer({ parentId, colIndex, colItems, widthPct }: {
    parentId: string
    colIndex: number
    colItems: EmailElementInstance[]
    widthPct: number
}) {
    const { isOver, setNodeRef: setDropRef } = useDroppable({
        id: `${COL_PREFIX}${parentId}:${colIndex}`,
        data: { isColumnZone: true, elementId: parentId, colIndex },
    })

    return (
        <div style={{ flex: widthPct, minWidth: 0 }} className="flex flex-col">
            <div className="text-[9px] text-slate-400 text-center mb-1 select-none">Coluna {colIndex + 1} ({widthPct}%)</div>
            <div
                ref={setDropRef}
                className={cn(
                    "rounded p-1 flex-1 flex flex-col min-h-[60px] transition-all border-2 border-dashed",
                    isOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50/40"
                )}
            >
                <SortableContext items={colItems.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-1">
                        {colItems.map(child => (
                            <EmailCanvasElement key={child.id} element={child} />
                        ))}
                    </div>
                </SortableContext>
                {colItems.length === 0 && (
                    <div className={cn(
                        "flex-1 flex items-center justify-center text-[10px] select-none",
                        isOver ? "text-indigo-500 font-medium" : "text-slate-300"
                    )}>
                        {isOver ? "Solte aqui" : "+ Arraste aqui"}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main canvas element ───────────────────────────────────────────────────────
export function EmailCanvasElement({ element }: { element: EmailElementInstance }) {
    const { selectedElement, setSelectedElement } = useEmailBuilder()
    const def = EmailElements[element.type]
    const isContainer = CONTAINER_TYPES.includes(element.type)
    const isColumnLayout = COLUMN_TYPES.includes(element.type)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: { type: element.type, elementId: element.id, isEmailContainer: isContainer },
    })

    const isSelected = selectedElement?.id === element.id
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    if (!def) return null

    const wrapperClass = cn(
        "relative group transition-all rounded",
        isSelected ? "ring-2 ring-indigo-400 z-10" : "hover:ring-1 hover:ring-indigo-200",
    )

    const typeLabel = !isSelected && (
        <div className="absolute -top-5 left-0 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none select-none">
            {element.type.replace('email-', '')}
        </div>
    )

    // ── Section container ───────────────────────────────────────────────────
    if (isContainer) {
        const sectionChildren = element.children || []
        return (
            <div ref={setNodeRef} style={style}
                className={wrapperClass}
            onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedElement(element) 
            }}
            >
                {typeLabel}
                {isSelected && <ElementToolbar element={element} dragHandleProps={{ ...attributes, ...listeners }} />}
                <div
                    className={cn("min-h-[72px] border-2 border-dashed rounded transition-all p-2",
                        isSelected ? "border-indigo-400" : "border-slate-300")}
                    style={{
                        backgroundColor: element.properties.backgroundColor || 'transparent',
                        paddingTop: element.properties.paddingTop ?? 16,
                        paddingBottom: element.properties.paddingBottom ?? 16,
                        paddingLeft: element.properties.paddingLeft ?? 0,
                        paddingRight: element.properties.paddingRight ?? 0,
                    }}
                >
                    {sectionChildren.length === 0 && (
                        <div className="flex items-center justify-center h-10 text-xs text-slate-400 pointer-events-none select-none">
                            Seção vazia
                        </div>
                    )}
                    <SortableContext items={sectionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-1">
                            {sectionChildren.map(child => (
                                <EmailCanvasElement key={child.id} element={child} />
                            ))}
                        </div>
                    </SortableContext>
                    <SectionDropZone parentId={element.id} />
                </div>
            </div>
        )
    }

    // ── Column layout (2 or 3 columns) ─────────────────────────────────────
    if (isColumnLayout) {
        const numCols = element.type === 'email-columns3' ? 3 : 2
        const columns: EmailElementInstance[][] = element.properties.columns || Array.from({ length: numCols }, () => [])
        const col1W = element.properties.column1Width ?? 50
        const widths = element.type === 'email-columns3'
            ? [33, 33, 34]
            : [col1W, 100 - col1W]

        return (
            <div ref={setNodeRef} style={style}
                className={wrapperClass}
                onClick={e => { e.stopPropagation(); setSelectedElement(element) }}
            >
                {typeLabel}
                {isSelected && <ElementToolbar element={element} dragHandleProps={{ ...attributes, ...listeners }} />}
                <div
                    className={cn("border-2 border-dashed rounded transition-all p-2",
                        isSelected ? "border-indigo-400" : "border-slate-300")}
                    style={{ backgroundColor: element.properties.backgroundColor || 'transparent' }}
                >
                    <div className="flex gap-2" style={{ gap: `${element.properties.gap ?? 16}px` }}>
                        {Array.from({ length: numCols }).map((_, i) => (
                            <ColumnRenderer
                                key={i}
                                parentId={element.id}
                                colIndex={i}
                                colItems={columns[i] || []}
                                widthPct={widths[i]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ── Leaf element ────────────────────────────────────────────────────────
    const DesignerComponent = def.designerComponent
    return (
        <div ref={setNodeRef} style={style}
            className={wrapperClass}
            onClick={e => { e.stopPropagation(); setSelectedElement(element) }}
        >
            {typeLabel}
            {isSelected && <ElementToolbar element={element} dragHandleProps={{ ...attributes, ...listeners }} />}
            <DesignerComponent element={element} />
        </div>
    )
}
