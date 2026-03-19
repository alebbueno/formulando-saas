"use client"

import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react"
import { EmailElementInstance } from "../types"
import { arrayMove } from "@dnd-kit/sortable"
import { exportEmailHtml } from "../html-export"

type PreviewDevice = 'desktop' | 'mobile'

type EmailBuilderContextType = {
    elements: EmailElementInstance[]
    setElements: Dispatch<SetStateAction<EmailElementInstance[]>>
    selectedElement: EmailElementInstance | null
    setSelectedElement: Dispatch<SetStateAction<EmailElementInstance | null>>
    previewDevice: PreviewDevice
    setPreviewDevice: Dispatch<SetStateAction<PreviewDevice>>

    addElement: (index: number, element: EmailElementInstance, parentId?: string) => void
    addToColumn: (containerId: string, colIndex: number, element: EmailElementInstance) => void
    moveToColumn: (activeId: string, containerId: string, colIndex: number) => void
    removeElement: (id: string) => void
    updateElement: (id: string, updates: Partial<EmailElementInstance>) => void
    updateElementProperties: (id: string, properties: Record<string, any>) => void
    moveElement: (activeId: string, overId: string, inside?: boolean) => void
    moveElementDirection: (id: string, direction: 'up' | 'down') => void
    duplicateElement: (id: string) => void

    exportHtml: () => string
}

const EmailBuilderContext = createContext<EmailBuilderContextType | null>(null)

export function useEmailBuilder() {
    const context = useContext(EmailBuilderContext)
    if (!context) throw new Error("useEmailBuilder must be used within an EmailBuilderProvider")
    return context
}

// ─── Recursive helpers ────────────────────────────────────────────────────────

export function findById(els: EmailElementInstance[], id: string): EmailElementInstance | null {
    for (const el of els) {
        if (el.id === id) return el
        if (el.children) {
            const f = findById(el.children, id)
            if (f) return f
        }
        // also scan column arrays stored in properties.columns
        if (el.properties?.columns) {
            for (const col of el.properties.columns as EmailElementInstance[][]) {
                const f = findById(col, id)
                if (f) return f
            }
        }
    }
    return null
}

function addRecursive(
    els: EmailElementInstance[],
    index: number,
    element: EmailElementInstance,
    parentId: string
): EmailElementInstance[] {
    return els.map(el => {
        if (el.id === parentId) {
            const newChildren = [...(el.children || [])]
            newChildren.splice(index, 0, element)
            return { ...el, children: newChildren }
        }
        if (el.children) return { ...el, children: addRecursive(el.children, index, element, parentId) }
        return el
    })
}

function removeRecursive(els: EmailElementInstance[], id: string): EmailElementInstance[] {
    return els
        .filter(el => el.id !== id)
        .map(el => {
            let updated = { ...el }
            if (updated.children) updated = { ...updated, children: removeRecursive(updated.children, id) }
            if (updated.properties?.columns) {
                updated = {
                    ...updated,
                    properties: {
                        ...updated.properties,
                        columns: (updated.properties.columns as EmailElementInstance[][]).map(
                            col => removeRecursive(col, id)
                        )
                    }
                }
            }
            return updated
        })
}

function updateRecursive(
    els: EmailElementInstance[],
    id: string,
    updates: Partial<EmailElementInstance>
): EmailElementInstance[] {
    return els.map(el => {
        if (el.id === id) return { ...el, ...updates }
        let updated = { ...el }
        if (updated.children) updated = { ...updated, children: updateRecursive(updated.children, id, updates) }
        if (updated.properties?.columns) {
            updated = {
                ...updated,
                properties: {
                    ...updated.properties,
                    columns: (updated.properties.columns as EmailElementInstance[][]).map(
                        col => updateRecursive(col, id, updates)
                    )
                }
            }
        }
        return updated
    })
}

function moveDirectionRecursive(
    els: EmailElementInstance[],
    id: string,
    direction: 'up' | 'down'
): EmailElementInstance[] {
    const idx = els.findIndex(el => el.id === id)
    if (idx !== -1) {
        const newIdx = direction === 'up' ? idx - 1 : idx + 1
        if (newIdx < 0 || newIdx >= els.length) return els
        return arrayMove(els, idx, newIdx)
    }
    return els.map(el => {
        let updated = { ...el }
        if (updated.children) updated = { ...updated, children: moveDirectionRecursive(updated.children, id, direction) }
        if (updated.properties?.columns) {
            updated = {
                ...updated,
                properties: {
                    ...updated.properties,
                    columns: (updated.properties.columns as EmailElementInstance[][]).map(
                        col => moveDirectionRecursive(col, id, direction)
                    )
                }
            }
        }
        return updated
    })
}

function duplicateRecursive(els: EmailElementInstance[], id: string): EmailElementInstance[] {
    const result: EmailElementInstance[] = []
    for (const el of els) {
        result.push(el)
        if (el.id === id) {
            const deepCopy = (o: EmailElementInstance): EmailElementInstance => ({
                ...o,
                id: crypto.randomUUID(),
                properties: { ...o.properties },
                children: o.children?.map(deepCopy),
            })
            result.push(deepCopy(el))
        } else if (el.children) {
            const newChildren = duplicateRecursive(el.children, id)
            if (newChildren !== el.children) result[result.length - 1] = { ...el, children: newChildren }
        }
    }
    return result
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function EmailBuilderProvider({
    children,
    initialElements,
}: {
    children: React.ReactNode
    initialElements?: EmailElementInstance[]
}) {
    const [elements, setElements] = useState<EmailElementInstance[]>(initialElements || [])
    const [selectedElement, setSelectedElement] = useState<EmailElementInstance | null>(null)
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')

    const addElement = (index: number, element: EmailElementInstance, parentId?: string) => {
        setElements(prev => {
            if (!parentId) {
                const next = [...prev]
                next.splice(index, 0, element)
                return next
            }
            return addRecursive(prev, index, element, parentId)
        })
    }

    const addToColumn = (containerId: string, colIndex: number, element: EmailElementInstance) => {
        setElements(prev => {
            const container = findById(prev, containerId)
            if (!container) return prev
            const cols: EmailElementInstance[][] = container.properties.columns || [[], []]
            const newCols = cols.map((col, i) => i === colIndex ? [...col, element] : col)
            return updateRecursive(prev, containerId, {
                properties: { ...container.properties, columns: newCols }
            })
        })
    }

    const moveToColumn = (activeId: string, containerId: string, colIndex: number) => {
        setElements(prev => {
            const activeEl = findById(prev, activeId)
            if (!activeEl || activeId === containerId) return prev
            // Remove from current location
            const withoutActive = removeRecursive(prev, activeId)
            // Add to column
            const container = findById(withoutActive, containerId)
            if (!container) return prev
            const cols: EmailElementInstance[][] = container.properties.columns || [[], []]
            const newCols = cols.map((col, i) => i === colIndex ? [...col, activeEl] : col)
            return updateRecursive(withoutActive, containerId, {
                properties: { ...container.properties, columns: newCols }
            })
        })
    }

    const removeElement = (id: string) => {
        setElements(prev => removeRecursive(prev, id))
        if (selectedElement?.id === id) setSelectedElement(null)
    }

    const updateElement = (id: string, updates: Partial<EmailElementInstance>) => {
        setElements(prev => updateRecursive(prev, id, updates))
        if (selectedElement?.id === id) setSelectedElement(prev => prev ? { ...prev, ...updates } : null)
    }

    const updateElementProperties = (id: string, properties: Record<string, any>) => {
        setElements(prev => {
            const current = findById(prev, id)
            if (!current) return prev
            return updateRecursive(prev, id, { properties: { ...current.properties, ...properties } })
        })
        if (selectedElement?.id === id) {
            setSelectedElement(prev => prev ? { ...prev, properties: { ...prev.properties, ...properties } } : null)
        }
    }

    const moveElement = (activeId: string, overId: string, inside: boolean = false) => {
        setElements(prev => {
            const activeEl = findById(prev, activeId)
            if (!activeEl) return prev

            const withoutActive = removeRecursive(prev, activeId)

            const insertRecursive = (els: EmailElementInstance[]): EmailElementInstance[] => {
                if (inside) {
                    return els.map(el => {
                        if (el.id === overId) return { ...el, children: [...(el.children || []), activeEl] }
                        if (el.children) return { ...el, children: insertRecursive(el.children) }
                        return el
                    })
                }
                const idx = els.findIndex(el => el.id === overId)
                if (idx !== -1) {
                    const next = [...els]
                    next.splice(idx, 0, activeEl)
                    return next
                }
                return els.map(el => el.children ? { ...el, children: insertRecursive(el.children) } : el)
            }

            const result = insertRecursive(withoutActive)
            if (!findById(result, activeId)) return prev
            return result
        })
    }

    const moveElementDirection = (id: string, direction: 'up' | 'down') => {
        setElements(prev => moveDirectionRecursive(prev, id, direction))
    }

    const duplicateElement = (id: string) => {
        setElements(prev => duplicateRecursive(prev, id))
    }

    const exportHtml = (): string => exportEmailHtml(elements)

    return (
        <EmailBuilderContext.Provider value={{
            elements, setElements,
            selectedElement, setSelectedElement,
            previewDevice, setPreviewDevice,
            addElement, addToColumn, moveToColumn,
            removeElement, updateElement, updateElementProperties,
            moveElement, moveElementDirection, duplicateElement,
            exportHtml,
        }}>
            {children}
        </EmailBuilderContext.Provider>
    )
}
