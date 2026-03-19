"use client"

import React, { useCallback } from "react"
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
    CollisionDetection,
} from "@dnd-kit/core"
import { EmailBuilderProvider, useEmailBuilder, findById } from "./context/email-builder-context"
import { EmailCanvas } from "./email-canvas"
import { EmailSidebarLeft } from "./email-sidebar-left"
import { EmailSidebarRight } from "./email-sidebar-right"
import { EmailElements } from "./elements"
import { EmailElementInstance, EmailElementType } from "./types"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone } from "lucide-react"
import { INTO_PREFIX, COL_PREFIX, CONTAINER_TYPES } from "./email-canvas-element"

// Prefer drop-zone IDs (into:* and col:*) over sortable IDs
const customCollision: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args)
    const zoneHit = pointerHits.find(c =>
        String(c.id).startsWith(INTO_PREFIX) || String(c.id).startsWith(COL_PREFIX)
    )
    if (zoneHit) return [zoneHit]
    const rectHits = rectIntersection(args)
    return getFirstCollision(rectHits) ? rectHits : pointerHits
}

function DesignerInner({ onHtmlChange }: { onHtmlChange?: (html: string) => void }) {
    const { addElement, addToColumn, moveToColumn, moveElement, elements, exportHtml, previewDevice, setPreviewDevice } = useEmailBuilder()
    const [activeElement, setActiveElement] = React.useState<EmailElementInstance | null>(null)

    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } })
    const sensors = useSensors(mouseSensor, touchSensor)

    const findEl = useCallback((id: string) => findById(elements, id), [elements])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event
        if (active.data.current?.fromSidebar) {
            const def = EmailElements[active.data.current.type as EmailElementType]
            if (def) setActiveElement(def.construct('preview'))
        } else {
            const found = findEl(String(active.id))
            if (found) setActiveElement(found)
        }
    }, [findEl])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveElement(null)
        const { active, over } = event
        if (!over) return

        const isFromSidebar = active.data.current?.fromSidebar === true
        const activeType = (active.data.current?.type || '') as EmailElementType
        const overId = String(over.id)
        const overIsMainCanvas = overId === 'email-canvas-droppable'

        // ── Detect drop zone type from ID prefix ──────────────────────────
        const overIsIntoSection = overId.startsWith(INTO_PREFIX)
        const overIsColumnZone  = overId.startsWith(COL_PREFIX)

        // Parse "col:{parentId}:{colIndex}"
        let columnParentId: string | null = null
        let columnIndex = 0
        if (overIsColumnZone) {
            const withoutPrefix = overId.slice(COL_PREFIX.length) // "{parentId}:{colIndex}"
            const lastColon = withoutPrefix.lastIndexOf(':')
            columnParentId = withoutPrefix.slice(0, lastColon)
            columnIndex = Number(withoutPrefix.slice(lastColon + 1))
        }

        // Parse "into:{parentId}"
        const sectionParentId = overIsIntoSection ? overId.slice(INTO_PREFIX.length) : null

        // Direct drop on a container element (e.g. empty section, no children)
        const overIsContainerEl = over.data.current?.isEmailContainer === true && !overIsIntoSection && !overIsColumnZone
        const containerElId = overIsContainerEl ? (over.data.current?.elementId as string || overId) : null

        if (isFromSidebar) {
            const def = EmailElements[activeType]
            if (!def) return
            const newEl = def.construct(crypto.randomUUID())

            if (overIsColumnZone && columnParentId) {
                // Drop into a specific column
                addToColumn(columnParentId, columnIndex, newEl)
            } else if (overIsIntoSection && sectionParentId) {
                // Drop into section drop zone
                const parent = findEl(sectionParentId)
                addElement(parent?.children?.length ?? 0, newEl, sectionParentId)
            } else if (containerElId && !CONTAINER_TYPES.includes(activeType)) {
                // Drop directly on empty section
                const parent = findEl(containerElId)
                addElement(parent?.children?.length ?? 0, newEl, containerElId)
            } else if (overIsMainCanvas) {
                addElement(elements.length, newEl)
            } else {
                const idx = elements.findIndex(el => el.id === overId)
                addElement(idx === -1 ? elements.length : idx, newEl)
            }
        } else {
            // Reordering existing elements
            const activeId = String(active.id)
            if (activeId === overId || overIsMainCanvas) return

            if (overIsColumnZone && columnParentId && columnParentId !== activeId) {
                // Move element into a specific column
                moveToColumn(activeId, columnParentId, columnIndex)
            } else if (overIsIntoSection && sectionParentId && sectionParentId !== activeId) {
                moveElement(activeId, sectionParentId, true)
            } else if (containerElId && containerElId !== activeId) {
                moveElement(activeId, containerElId, true)
            } else if (!overIsColumnZone && !overIsIntoSection) {
                moveElement(activeId, overId, false)
            }
        }
    }, [elements, addElement, addToColumn, moveElement, findEl])

    React.useEffect(() => {
        const html = exportHtml()
        onHtmlChange?.(html)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elements])

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={customCollision}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full">
                <div className="h-10 border-b bg-white flex items-center justify-between px-4 shrink-0">
                    <span className="text-xs text-slate-500">Clique para inserir • Arraste para posicionar</span>
                    <div className="flex items-center gap-1">
                        <Button variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setPreviewDevice('desktop')} title="Desktop">
                            <Monitor className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setPreviewDevice('mobile')} title="Mobile">
                            <Smartphone className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <EmailSidebarLeft />
                    <EmailCanvas />
                    <EmailSidebarRight />
                </div>
            </div>

            <DragOverlay>
                {activeElement && (() => {
                    const def = EmailElements[activeElement.type]
                    if (!def) return null
                    const Comp = def.designerComponent
                    return (
                        <div className="opacity-80 shadow-xl pointer-events-none rounded-lg overflow-hidden border border-indigo-300 bg-white p-2 max-w-[380px]">
                            <Comp element={activeElement} />
                        </div>
                    )
                })()}
            </DragOverlay>
        </DndContext>
    )
}

interface EmailDesignerProps {
    initialElements?: EmailElementInstance[]
    onHtmlChange?: (html: string) => void
}

export function EmailDesigner({ initialElements, onHtmlChange }: EmailDesignerProps) {
    return (
        <EmailBuilderProvider initialElements={initialElements}>
            <DesignerInner onHtmlChange={onHtmlChange} />
        </EmailBuilderProvider>
    )
}
