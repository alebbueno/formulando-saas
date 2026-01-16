"use client"

import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react"
import { LPElement, LPDesignerMode } from "../types"
import { arrayMove } from "@dnd-kit/sortable"
import { saveLandingPage } from "@/app/lp/builder/[id]/actions"

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

type LPBuilderContextType = {
    elements: LPElement[]
    setElements: Dispatch<SetStateAction<LPElement[]>>
    selectedElement: LPElement | null
    setSelectedElement: Dispatch<SetStateAction<LPElement | null>>
    mode: LPDesignerMode
    setMode: Dispatch<SetStateAction<LPDesignerMode>>
    previewDevice: PreviewDevice
    setPreviewDevice: Dispatch<SetStateAction<PreviewDevice>>
    projectId: string | null
    setProjectId: (id: string) => void
    isSaving: boolean
    lastSaved: Date | null
    isPublished: boolean
    setIsPublished: (published: boolean) => void
    slug: string | null
    setSlug: (slug: string) => void
    lpName: string
    setLpName: (name: string) => void
    customDomain: string | null
    setCustomDomain: (domain: string | null) => void
    settings: any
    setSettings: Dispatch<SetStateAction<any>>

    addElement: (index: number, element: LPElement, parentId?: string) => void
    removeElement: (id: string) => void
    updateElement: (id: string, element: Partial<LPElement>) => void
    moveElement: (activeId: string, overId: string, inside?: boolean) => void
    moveElementDirection?: (id: string, direction: 'up' | 'down') => void
    duplicateElement?: (id: string) => void
    saveLP: () => Promise<{ success: boolean; error?: string }>
    workspaceId: string | null
}

const LPBuilderContext = createContext<LPBuilderContextType | null>(null)

export function useLPBuilder() {
    const context = useContext(LPBuilderContext)
    if (!context) {
        throw new Error("useLPBuilder must be used within a LPBuilderProvider")
    }
    return context
}

export function LPBuilderProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
    const [elements, setElements] = useState<LPElement[]>(initialData?.content || [])
    const [selectedElement, setSelectedElement] = useState<LPElement | null>(null)
    const [mode, setMode] = useState<LPDesignerMode>('builder')
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
    const [projectId, setProjectId] = useState<string | null>(initialData?.id || null)
    const [workspaceId, setWorkspaceId] = useState<string | null>(initialData?.workspace_id || null)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(initialData?.updated_at ? new Date(initialData.updated_at) : null)
    const [isPublished, setIsPublished] = useState(initialData?.is_published || false)
    const [slug, setSlug] = useState<string | null>(initialData?.slug || null)
    const [lpName, setLpName] = useState<string>(initialData?.name || "Landing Page")
    const [customDomain, setCustomDomain] = useState<string | null>(initialData?.custom_domain || null)
    const [settings, setSettings] = useState<any>(initialData?.settings || {})

    const addElement = (index: number, element: LPElement, parentId?: string) => {
        setElements((prev) => {
            if (!parentId) {
                const newElements = [...prev]
                newElements.splice(index, 0, element)
                return newElements
            }

            // Recursive function to find parent and add child
            const addRecursive = (els: LPElement[]): LPElement[] => {
                return els.map(el => {
                    if (el.id === parentId) {
                        const newChildren = [...(el.children || [])]
                        newChildren.splice(index, 0, element)
                        return { ...el, children: newChildren }
                    }
                    if (el.children) {
                        return { ...el, children: addRecursive(el.children) }
                    }
                    return el
                })
            }
            return addRecursive(prev)
        })
    }

    const removeElement = (id: string) => {
        setElements((prev) => {
            const removeRecursive = (els: LPElement[]): LPElement[] => {
                return els
                    .filter(el => el.id !== id)
                    .map(el => {
                        if (el.children) {
                            return { ...el, children: removeRecursive(el.children) }
                        }
                        return el
                    })
            }
            return removeRecursive(prev)
        })
        if (selectedElement?.id === id) {
            setSelectedElement(null)
        }
    }

    const updateElement = (id: string, elementUpdates: Partial<LPElement>) => {
        setElements((prev) => {
            const updateRecursive = (els: LPElement[]): LPElement[] => {
                return els.map(el => {
                    if (el.id === id) {
                        return { ...el, ...elementUpdates }
                    }
                    if (el.children) {
                        return { ...el, children: updateRecursive(el.children) }
                    }
                    return el
                })
            }
            return updateRecursive(prev)
        })

        // Update selected element ref if it's the one being updated
        if (selectedElement?.id === id) {
            setSelectedElement((prev) => prev ? { ...prev, ...elementUpdates } : null)
        }
    }

    const moveElement = (activeId: string, overId: string, inside: boolean = false) => {
        setElements((prev) => {
            // 1. Find and Extract Active Element
            let activeElement: LPElement | null = null;

            const removeRecursive = (els: LPElement[]): LPElement[] => {
                const result: LPElement[] = [];
                for (const el of els) {
                    if (el.id === activeId) {
                        activeElement = el; // Capture it
                        continue; // Skip adding it (remove)
                    }
                    if (el.children) {
                        result.push({ ...el, children: removeRecursive(el.children) });
                    } else {
                        result.push(el);
                    }
                }
                return result;
            }

            // Temporarily remove to see if we can find it. 
            // NOTE: We should check validity BEFORE removing to avoid state corruption if invalid.
            // But getting the element object is easier if we traverse. 
            // Let's find it first without removing.
            const findRecursive = (els: LPElement[]): LPElement | null => {
                for (const el of els) {
                    if (el.id === activeId) return el;
                    if (el.children) {
                        const found = findRecursive(el.children);
                        if (found) return found;
                    }
                }
                return null;
            }
            const foundActive = findRecursive(prev);

            if (!foundActive) return prev; // Not found

            // VALIDATION: Container cannot receive Section
            // We need to know the Target Parent to validate.

            // Helper to get element by ID
            const getElementById = (els: LPElement[], id: string): LPElement | null => {
                // If ID is root? No, ID is string.
                for (const el of els) {
                    if (el.id === id) return el;
                    if (el.children) {
                        const found = getElementById(el.children, id);
                        if (found) return found;
                    }
                }
                return null;
            }

            // Validation Logic
            if (foundActive.type === 'section') {
                if (inside) {
                    // Dropping INSIDE overId. overId MUST NOT be container.
                    // It must be ROOT? We can't drop inside Root via ID usually. Root ID isn't standard.
                    // If overId is a Section? Section inside Section?
                    // If overId is Container? Section inside Container -> FORBIDDEN.
                    const targetContainer = getElementById(prev, overId);
                    if (targetContainer && targetContainer.type === 'container') {
                        console.warn("Operation Blocked: Cannot place Section inside a Container.");
                        return prev;
                    }
                } else {
                    // Sorting Next To overId.
                    // overId's PARENT must not be Container.
                    // We need to find parent of overId.
                    const findParent = (els: LPElement[], id: string): LPElement | null => {
                        for (const el of els) {
                            if (el.children?.some(c => c.id === id)) return el;
                            if (el.children) {
                                const p = findParent(el.children, id);
                                if (p) return p;
                            }
                        }
                        return null; // Root or not found
                    }
                    const targetParent = findParent(prev, overId);
                    if (targetParent && targetParent.type === 'container') {
                        console.warn("Operation Blocked: Cannot place Section inside a Container.");
                        return prev;
                    }
                }
            }


            // Proceed with Move
            // 2. Remove from old location
            const elementsWithoutActive = removeRecursive(prev);

            if (!activeElement) return prev; // Should have been found

            // 3. Insert into new location
            const insertRecursive = (els: LPElement[]): LPElement[] => {
                // Case A: Inside (Nest)
                if (inside) {
                    return els.map(el => {
                        if (el.id === overId) {
                            return { ...el, children: [...(el.children || []), activeElement!] }
                        }
                        if (el.children) {
                            return { ...el, children: insertRecursive(el.children) }
                        }
                        return el
                    });
                }

                // Case B: Sort (Sibling)
                // Check if overId is in this level
                const index = els.findIndex(e => e.id === overId);
                if (index !== -1) {
                    const newEls = [...els];
                    // Insert before or after? dnd-kit usually implies replacement/swap, 
                    // but standard insert is usually 'at index'. 
                    // Let's insert AT index (pushing others down).
                    // Logic: If I drag A over B, I want A to take B's spot, B moves down.
                    newEls.splice(index, 0, activeElement!);
                    return newEls;
                }

                return els.map(el => {
                    if (el.children) {
                        return { ...el, children: insertRecursive(el.children) }
                    }
                    return el;
                });
            }

            // Special Case: Sorting at Root Level
            // insertRecursive handles Root level because we pass 'elementsWithoutActive' (Root Array) to it first.
            const finalResult = insertRecursive(elementsWithoutActive);

            // SAFETY CHECK: Transaction Logic
            // If the element is NOT in the final result, something went wrong (e.g., target not found).
            // In this case, we MUST ABORT to prevent data loss (element being deleted).
            const findRecursiveCheck = (els: LPElement[]): boolean => {
                for (const el of els) {
                    if (el.id === activeId) return true;
                    if (el.children && findRecursiveCheck(el.children)) return true;
                }
                return false;
            }

            if (!findRecursiveCheck(finalResult)) {
                console.warn("Drag Transaction Aborted: Element would be lost (Target not found or invalid).", { activeId, overId, inside });
                return prev; // Rollback
            }

            return finalResult;
        })
    }

    const moveElementDirection = (id: string, direction: 'up' | 'down') => {
        setElements((prev) => {
            const moveRecursive = (els: LPElement[]): LPElement[] => {
                // Check if element is in this array
                const index = els.findIndex(el => el.id === id);
                if (index !== -1) {
                    // Use arrayMove to swap
                    const newIndex = direction === 'up' ? index - 1 : index + 1;
                    if (newIndex >= 0 && newIndex < els.length) {
                        return arrayMove(els, index, newIndex);
                    }
                    return els; // Cannot move (boundary)
                }

                // If not found, look in children
                return els.map(el => {
                    if (el.children) {
                        return { ...el, children: moveRecursive(el.children) }
                    }
                    return el
                });
            }
            return moveRecursive(prev);
        })
    }

    const duplicateElement = (id: string) => {
        setElements((prev) => {
            const duplicateRecursive = (els: LPElement[]): { elements: LPElement[], found: boolean } => {
                let foundInThisLevel = false
                const newEls = [] as LPElement[]

                for (const el of els) {
                    newEls.push(el)

                    if (el.id === id) {
                        foundInThisLevel = true
                        // Create deep copy with new IDs
                        const createDeepCopy = (original: LPElement): LPElement => {
                            const newId = crypto.randomUUID()
                            return {
                                ...original,
                                id: newId,
                                children: original.children ? original.children.map(createDeepCopy) : undefined
                            }
                        }
                        const copy = createDeepCopy(el)
                        newEls.push(copy)
                    }

                    if (!foundInThisLevel && el.children) {
                        const result = duplicateRecursive(el.children)
                        if (result.found) {
                            // Update this element with new children
                            newEls[newEls.length - 1] = { ...el, children: result.elements }
                            // If found deeper, we don't set foundInThisLevel, but we updated the tree
                            // We can return now? No, we need to finish checking interactions? 
                            // Actually, if found deeper, we just return the new structure.
                            // But we need to propagate 'found' signal up if we care, 
                            // here we just rely on immutable updates.
                            // Wait, if found in children, we just updated the `newEls` last item. 
                            // But we need to ensure we return the modified list.
                        }
                    }
                }

                // If we found it in children, `newEls` contains the updated parent. 
                // We just return `newEls`.

                // Logic refinement:
                // We map over elements. If we find the target, we insert copy after it.
                // If not, we try to map children.

                // Let's rewrite slightly simpler:
                return { elements: newEls, found: foundInThisLevel || newEls.some(e => e.children !== els.find(old => old.id === e.id)?.children) }
                // The 'found' check above is a bit hacky. 
                // Let's use a standard recursion that returns { modified: boolean, elements: [] }
            }

            // Simpler Implementation
            const cloneRecursive = (list: LPElement[]): LPElement[] => {
                const res: LPElement[] = []
                for (const el of list) {
                    res.push(el)
                    if (el.id === id) {
                        // Clone it
                        const createDeepCopy = (original: LPElement): LPElement => {
                            const newId = crypto.randomUUID()
                            return {
                                ...original,
                                id: newId,
                                children: original.children ? original.children.map(createDeepCopy) : undefined
                            }
                        }
                        res.push(createDeepCopy(el))
                    } else if (el.children) {
                        const newChildren = cloneRecursive(el.children)
                        if (newChildren !== el.children) {
                            res[res.length - 1] = { ...el, children: newChildren }
                        }
                    }
                }
                return res
            }

            return cloneRecursive(prev)
        })
    }

    const saveLP = async (): Promise<{ success: boolean; error?: string }> => {
        if (!projectId) {
            return { success: false, error: "ID do projeto não definido" }
        }

        setIsSaving(true)

        try {
            console.log('💾 Saving LP - Total elements:', elements.length)

            const result = await saveLandingPage(projectId, elements, lpName, slug || undefined, settings)

            if (result.success) {
                setLastSaved(new Date())
            }

            return result
        } catch (error) {
            console.error("Error in saveLP:", error)
            return { success: false, error: "Erro ao salvar" }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <LPBuilderContext.Provider
            value={{
                elements,
                setElements,
                selectedElement,
                setSelectedElement,
                mode,
                setMode,
                previewDevice,
                setPreviewDevice,
                projectId,
                setProjectId,
                isSaving,
                lastSaved,
                isPublished,
                setIsPublished,
                slug,
                setSlug,
                lpName,
                setLpName,
                customDomain,
                setCustomDomain,
                settings,
                setSettings,
                addElement,
                removeElement,
                updateElement,
                moveElement,
                moveElementDirection,
                moveElementDirection,
                duplicateElement,
                saveLP,
                workspaceId
            }}
        >
            {children}
        </LPBuilderContext.Provider>
    )
}
