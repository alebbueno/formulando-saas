"use client"

import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core"
import { BuilderSidebar } from "@/components/builder/builder-sidebar"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { PropertiesPanel } from "@/components/builder/properties-panel"
import { BuilderProvider, useBuilder, FormElementType, FormElementInstance } from "@/context/builder-context"
import { FormElements } from "@/components/builder/form-elements"
import { useState } from "react"

import { BuilderHeader } from "@/components/builder/builder-header"
import { TemplateSelector } from "@/components/builder/template-selector"
import { AIChat } from "@/components/builder/ai-chat"
import { toast } from "sonner"

import { updateProjectContent } from "@/actions/form"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen } from "lucide-react"

function BuilderPageContent({ project }: { project: any }) {
    const projectId = project.id
    const { elements, addElement, setElements } = useBuilder()
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
    const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
    const [isAIChatOpen, setIsAIChatOpen] = useState(false)

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 5,
            },
        })
    )

    const [activeDragItem, setActiveDragItem] = useState<any>(null)
    const [projectName, setProjectName] = useState(project.name || "Untitled Form")

    const handleSave = async () => {
        try {
            await updateProjectContent(projectId, JSON.stringify(elements), projectName)
            toast.success("Salvo com sucesso!")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar")
        }
    }

    const handlePreview = () => {
        window.open(`/submit/${projectId}`, '_blank')
    }

    const handleInsertTemplate = (templateElements: FormElementInstance[]) => {
        // Add all template elements to the current form
        templateElements.forEach((element, index) => {
            addElement(elements.length + index, element)
        })
    }

    const handleInsertAI = (aiElements: FormElementInstance[]) => {
        // Add all AI-generated elements to the current form
        aiElements.forEach((element, index) => {
            addElement(elements.length + index, element)
        })
    }

    return (
        <>
            <TemplateSelector
                open={isTemplateSelectorOpen}
                onOpenChange={setIsTemplateSelectorOpen}
                onInsert={handleInsertTemplate}
            />
            <AIChat
                open={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
                onInsert={handleInsertAI}
            />
            <DndContext
            sensors={sensors}
            onDragStart={(event) => {
                setActiveDragItem(event.active.data.current)
            }}
            onDragOver={(event) => {
                const { active, over } = event
                if (!over) return

                const activeId = active.id
                const overId = over.id

                const isDesignerBtn = active.data.current?.isDesignerBtn
                const isDroppingOverDesignerItem = over.data.current?.isDesignerElement

                if (isDesignerBtn && isDroppingOverDesignerItem) {
                    return
                }

                if (isDesignerBtn && over.data.current?.isDesignerDropArea) {
                    return
                }
            }}
            onDragEnd={(event) => {
                setActiveDragItem(null)
                const { active, over } = event
                if (!over) return

                const activeData = active.data.current
                const overData = over.data.current

                const isDesignerBtn = activeData?.isDesignerBtn
                const isDroppingOverDesignerDropArea = overData?.isDesignerDropArea
                const isDroppingOverDesignerElement = overData?.isDesignerElement

                if (isDesignerBtn) {
                    const type = activeData?.type
                    const newElement = FormElements[type as FormElementType].construct(
                        crypto.randomUUID()
                    )

                    if (isDroppingOverDesignerDropArea) {
                        addElement(elements.length, newElement)
                        return
                    }

                    if (isDroppingOverDesignerElement) {
                        const overElementIndex = elements.findIndex(el => el.id === over.id)
                        if (overElementIndex === -1) {
                            throw new Error("Element not found")
                        }
                        addElement(overElementIndex + 1, newElement)
                        return
                    }
                }

                const isDraggingDesignerElement = activeData?.isDesignerElement
                if (isDraggingDesignerElement && isDroppingOverDesignerElement) {
                    const activeId = active.id
                    const overId = over.id

                    if (activeId !== overId) {
                        const oldIndex = elements.findIndex(el => el.id === activeId)
                        const newIndex = elements.findIndex(el => el.id === overId)

                        const newElements = [...elements]
                        const [movedElement] = newElements.splice(oldIndex, 1)
                        newElements.splice(newIndex, 0, movedElement)
                        setElements(newElements)
                    }
                }
            }}
        >
            <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
                <BuilderHeader
                    onSave={handleSave}
                    onPreview={handlePreview}
                    projectName={projectName}
                    onProjectNameChange={setProjectName}
                    onOpenTemplates={() => setIsTemplateSelectorOpen(true)}
                />
                <div className="flex flex-grow w-full h-[calc(100vh-64px)] relative">

                    <div className="flex h-full relative">
                        {isLeftSidebarOpen && <BuilderSidebar />}
                        <Button
                            variant="secondary"
                            className="h-8 w-6 rounded-r-md rounded-l-none absolute -right-6 top-1/2 -translate-y-1/2 z-10 p-0 border-l-0 shadow-md"
                            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                        >
                            {isLeftSidebarOpen ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />}
                        </Button>
                    </div>

                    <BuilderCanvas
                        onOpenTemplates={() => setIsTemplateSelectorOpen(true)}
                        onOpenAIChat={() => setIsAIChatOpen(true)}
                    />

                    <div className="flex h-full relative">
                        <Button
                            variant="secondary"
                            className="h-8 w-6 rounded-l-md rounded-r-none absolute -left-6 top-1/2 -translate-y-1/2 z-10 p-0 border-r-0 shadow-md"
                            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                        >
                            {isRightSidebarOpen ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
                        </Button>

                        {isRightSidebarOpen && (
                            <div className="w-[300px] max-w-[300px] border-l-2 border-muted bg-background h-full overflow-y-auto">
                                <PropertiesPanel />
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <DragOverlay>
                {activeDragItem ? (
                    <div className="pointer-events-none opacity-80">
                        <div className="h-24 w-24 bg-primary text-white flex items-center justify-center rounded-md">
                            Dragging...
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
        </>
    )
}

export function BuilderClient({ project }: { project: any }) {
    // Parse content if it's a string (Double JSON encoding fix)
    let defaultElements: FormElementInstance[] = []

    if (project.content) {
        if (typeof project.content === 'string') {
            try {
                defaultElements = JSON.parse(project.content)
            } catch (e) {
                console.error("Failed to parse project content", e)
                defaultElements = []
            }
        } else {
            // Already an object/array
            defaultElements = project.content
        }
    }

    return (
        <BuilderProvider defaultElements={defaultElements}>
            <BuilderPageContent project={project} />
        </BuilderProvider>
    )
}
