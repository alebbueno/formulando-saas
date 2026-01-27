"use client"

import { useSearchParams } from "next/navigation"

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
import { OnboardingModal } from "@/components/builder/onboarding-modal"
import { SuccessModal } from "@/components/builder/success-modal"
import { toast } from "sonner"

import { updateProjectContent, publishProject } from "@/actions/form"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, Sparkles } from "lucide-react"

function BuilderPageContent({ project }: { project: any }) {
    const projectId = project.id
    const { elements, addElement, setElements } = useBuilder()
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
    const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
    const [isAIChatOpen, setIsAIChatOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isPublished, setIsPublished] = useState(project.is_published || false)

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

    const searchParams = useSearchParams()
    // Initialize state from URL param, but keep it true even if param is removed
    const [isOnboarding] = useState(() => searchParams?.get("onboarding") === "true")

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
            setIsSaving(true)
            await updateProjectContent(projectId, JSON.stringify(elements), projectName)

            if (isOnboarding) {
                await publishProject(projectId, true)
                setIsPublished(true)
                toast.success("Salvo e publicado com sucesso!")
                setIsSuccessModalOpen(true)
            } else {
                toast.success("Salvo com sucesso!")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar")
        } finally {
            setIsSaving(false)
        }
    }

    const handlePublishToggle = async (checked: boolean) => {
        setIsPublished(checked) // Optimistic update
        try {
            await publishProject(projectId, checked)
            if (checked) {
                toast.success("Formulário publicado com sucesso!")
                setIsSuccessModalOpen(true)
            } else {
                toast.info("Formulário despublicado (rascunho).")
            }
        } catch (error) {
            console.error(error)
            setIsPublished(!checked) // Revert on error
            toast.error("Erro ao atualizar status de publicação")
        }
    }

    const handlePreview = () => {
        window.open(`/submit/${projectId}`, '_blank')
    }

    const handleInsertTemplate = (templateElements: FormElementInstance[]) => {
        templateElements.forEach((element, index) => {
            addElement(elements.length + index, element)
        })
    }

    const handleInsertAI = (aiElements: FormElementInstance[]) => {
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
                elements={elements}
                onElementsChange={setElements}
            />

            <OnboardingModal
                onInsertAI={handleInsertAI}
                onOpenTemplates={() => setIsTemplateSelectorOpen(true)}
            />

            <SuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                projectSlug={project.slug}
                projectName={projectName}
            />

            {/* Floating AI Button (FAB) - Visible only when we have elements and chat is closed */}
            {elements.length > 0 && !isAIChatOpen && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <Button
                        onClick={() => setIsAIChatOpen(true)}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:scale-110 transition-transform duration-300 border-2 border-white/20"
                    >
                        <Sparkles className="h-7 w-7 text-white animate-pulse" />
                    </Button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                onDragStart={(event) => {
                    setActiveDragItem(event.active.data.current)
                }}
                onDragOver={(event) => {
                    const { active, over } = event
                    if (!over) return

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
                        isPublished={isPublished}
                        onPublishToggle={handlePublishToggle}
                        isSaving={isSaving}
                        isOnboarding={isOnboarding}
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
                                <div className="w-[320px] max-w-[320px] h-full relative">
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
            defaultElements = project.content
        }
    }

    let defaultSettings = undefined;
    if (project.settings) {
        defaultSettings = project.settings;
    }

    return (
        <BuilderProvider defaultElements={defaultElements} defaultSettings={defaultSettings}>
            <BuilderPageContent project={project} />
        </BuilderProvider>
    )
}
