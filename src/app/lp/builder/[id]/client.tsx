"use client"

import React from "react"
import { LPBuilderProvider, useLPBuilder } from "@/components/lp-builder/context/lp-builder-context"
import { Designer } from "@/components/lp-builder/designer"
import { SidebarLeft } from "@/components/lp-builder/sidebar-left"
import { SidebarRight } from "@/components/lp-builder/sidebar-right"
import { Project, LandingPage } from "@/types"
import { BuilderToolbar } from "@/components/lp-builder/toolbar"
import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay } from "@dnd-kit/core"
import { LPElementType, LPElement } from "@/components/lp-builder/types"
import { cn } from "@/lib/utils"

function LPBuilderEditor({ project }: { project: Project | LandingPage }) {
    const { addElement, elements, moveElement, setProjectId, setElements, setSlug, setIsPublished, setLpName, setCustomDomain, setSettings } = useLPBuilder()

    // Initialize project ID and load existing content
    React.useEffect(() => {
        setProjectId(project.id)
        setSlug(project.slug)
        setLpName(project.name)
        setIsPublished(project.is_published)
        setCustomDomain((project as any).custom_domain || null)
        setSettings((project as any).settings || {}) // Sync settings
        if (project.content && Array.isArray(project.content)) {
            setElements(project.content as LPElement[])
        }
    }, [project.id, project.slug, project.is_published, project.content, project.name, (project as any).settings, setProjectId, setSlug, setIsPublished, setElements, setSettings, setLpName, setCustomDomain])

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // 10px movement to start drag
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        // 1. Handling Drag from Sidebar (Add new)
        const type = active.data.current?.type as LPElementType
        const isFromSidebar = active.data.current?.fromSidebar

        if (isFromSidebar && type) {
            let newElement: LPElement;

            if (type === '2-col') {
                newElement = {
                    id: crypto.randomUUID(),
                    type: 'container', // The wrapper is a Container
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
                            styles: { flex: '1', minHeight: '100px', padding: '10px' }, // Column 1
                            children: []
                        },
                        {
                            id: crypto.randomUUID(),
                            type: 'container',
                            styles: { flex: '1', minHeight: '100px', padding: '10px' }, // Column 2
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
                        { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', padding: '10px' }, children: [] },
                        { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', padding: '10px' }, children: [] },
                        { id: crypto.randomUUID(), type: 'container', styles: { flex: '1', minHeight: '100px', padding: '10px' }, children: [] }
                    ]
                }
            } else {
                // Standard Element
                newElement = {
                    id: crypto.randomUUID(),
                    type: type,
                    styles: {
                        width: type === 'container' || type === 'section' ? '100%' : undefined,
                        ...((type === 'container' || type === 'section') && { display: 'flex', flexDirection: 'column', padding: '20px' })
                    },
                    children: [],
                    content: type === "text" ? "Texto de exemplo" : type === "button" ? "Clique aqui" : undefined
                }
            }

            if (over.id === "canvas-droppable") {
                addElement(elements.length, newElement)
            } else {
                // Handling SideBar drop into Container
                if (over.data.current?.isContainer) {
                    // Check if it's a drop-zone
                    const realId = (over.id as string).toString().replace("-drop-zone", "")
                    addElement(0, newElement, realId)
                } else if (over.data.current?.elementId) {
                    // Dropped over a non-container item? 
                    // Add after it (as sibling)
                    // We need parent ID for this. `addElement` currently only supports `parentId` (adding as child) or root.
                    // To add as sibling, we need a new context function or logic.
                    // For now, fallback to root or ignore. 
                    // Let's add to root for safety.
                    addElement(elements.length, newElement)
                } else {
                    addElement(elements.length, newElement)
                }
            }
        }
        // 2. Handling Reordering (Sortable)
        else if (active.id !== over.id) {
            // Check for explicit Drop Zone (Nesting)
            const isDropZone = (over.id as string).toString().endsWith("-drop-zone");
            const realOverId = isDropZone ? (over.id as string).replace("-drop-zone", "") : (over.id as string);

            // Determine if we should NEST or SORT
            const isOverContainer = over.data.current?.isContainer;

            // Rules:
            // 1. If dropped on Drop Zone (Center of container) -> Nesting (dropInside=true)
            // 2. If dropped on Container itself (Sortable layer) -> Check type to decide
            // 3. If dropped on regular item -> Sorting (dropInside=false)

            let dropInside = isDropZone;

            // If dropped on a container (not drop-zone), decide based on active type
            if (!dropInside && isOverContainer) {
                const activeType = active.data.current?.type;
                // Non-section elements nest into containers by default for easier UX
                if (activeType !== 'section') {
                    dropInside = true;
                }
            }

            // Extra Validation: Section cannot be inside Container
            const activeType = active.data.current?.type;
            if (dropInside && isOverContainer && activeType === 'section') {
                dropInside = false; // Block nesting
            }

            moveElement(active.id as string, realOverId, dropInside)
        }
    }



    const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true)
    const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true)

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-56px)]">
                <BuilderToolbar />
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Sidebar Wrapper */}
                    <div
                        className={cn(
                            "transition-all duration-300 ease-in-out flex-shrink-0 border-r bg-white z-20",
                            leftSidebarOpen ? "w-80 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden border-none"
                        )}
                    >
                        <div className="w-80 h-full">
                            <SidebarLeft />
                        </div>
                    </div>

                    {/* Left Toggle Button - Floating */}
                    <button
                        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                        className={cn(
                            "absolute top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-6 h-12 bg-white border border-slate-200 shadow-md rounded-r-md text-muted-foreground hover:text-primary transition-all duration-300",
                            leftSidebarOpen ? "left-80" : "left-0"
                        )}
                        title={leftSidebarOpen ? "Fecbar barra lateral" : "Abrir barra lateral"}
                    >
                        {leftSidebarOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        )}
                    </button>

                    <main className="flex-1 overflow-y-auto bg-slate-50 p-8 transition-all duration-300">
                        <Designer />
                    </main>

                    {/* Right Toggle Button - Floating */}
                    <button
                        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                        className={cn(
                            "absolute top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-6 h-12 bg-white border border-slate-200 shadow-md rounded-l-md text-muted-foreground hover:text-primary transition-all duration-300",
                            rightSidebarOpen ? "right-80" : "right-0"
                        )}
                        title={rightSidebarOpen ? "Fechar propriedades" : "Abrir propriedades"}
                    >
                        {rightSidebarOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        )}
                    </button>

                    {/* Right Sidebar Wrapper */}
                    <div
                        className={cn(
                            "transition-all duration-300 ease-in-out flex-shrink-0 border-l bg-white z-20",
                            rightSidebarOpen ? "w-80 translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 overflow-hidden border-none"
                        )}
                    >
                        <div className="w-80 h-full">
                            <SidebarRight />
                        </div>
                    </div>
                </div>
            </div>
            {/* Potential DragOverlay here in future */}
        </DndContext>
    )
}

export function LPBuilderClient({ project }: { project: Project | LandingPage }) {
    return (
        <LPBuilderProvider initialData={project}>
            <LPBuilderEditor project={project} />
        </LPBuilderProvider>
    )
}
