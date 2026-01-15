"use client"

import { useState, useRef } from "react"
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    pointerWithin
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Lead, updateLeadStatus } from "@/actions/leads"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Building2, MoreHorizontal, Calendar, TrendingUp, Plus, Trash2, GripVertical, Pencil } from "lucide-react"
import { LeadDetailsSheet } from "@/components/leads/lead-details-sheet"
import { useWorkspace } from "@/context/workspace-context"
import type { KanbanColumn } from "@/actions/workspaces"
import { updateWorkspaceKanbanColumns } from "@/actions/workspaces"
import { toast } from "sonner"

const DEFAULT_COLUMNS: KanbanColumn[] = [
    { id: 'Novo Lead', label: 'Novo Lead', color: 'bg-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
    { id: 'Qualificado', label: 'Qualificado', color: 'bg-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
    { id: 'Em contato', label: 'Em contato', color: 'bg-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
    { id: 'Oportunidade', label: 'Oportunidade', color: 'bg-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
    { id: 'Perdido', label: 'Perdido', color: 'bg-red-500', bg: 'bg-red-50/50 dark:bg-red-900/10' }
]

interface LeadsKanbanProps {
    initialLeads: Lead[]
}

export function LeadsKanban({ initialLeads }: LeadsKanbanProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const { activeWorkspace, refreshWorkspaces } = useWorkspace()

    // Use workspace columns or defaults
    const [localColumns, setLocalColumns] = useState<KanbanColumn[]>([])

    // Sync with workspace columns
    useState(() => {
        if (activeWorkspace?.kanban_columns) {
            setLocalColumns(activeWorkspace.kanban_columns as KanbanColumn[])
        } else {
            setLocalColumns(DEFAULT_COLUMNS)
        }
    })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const saveColumns = async (newColumns: KanbanColumn[]) => {
        setLocalColumns(newColumns)
        if (activeWorkspace) {
            try {
                await updateWorkspaceKanbanColumns(activeWorkspace.id, newColumns)
                await refreshWorkspaces()
            } catch (error) {
                console.error("Failed to save columns", error)
                toast.error("Erro ao salvar colunas")
            }
        }
    }

    const handleAddColumn = () => {
        const newColumn: KanbanColumn = {
            id: `col_${Date.now()}`,
            label: "Nova Coluna",
            color: "bg-slate-500",
            bg: "bg-slate-50/50 dark:bg-slate-900/10"
        }
        saveColumns([...localColumns, newColumn])
    }

    const handleDeleteColumn = (id: string) => {
        const hasLeads = leads.some(l => l.status === id)
        if (hasLeads) {
            toast.error("Não é possível excluir colunas com leads")
            return
        }
        saveColumns(localColumns.filter(c => c.id !== id))
    }

    const handleRenameColumn = (id: string, newLabel: string) => {
        saveColumns(localColumns.map(c => c.id === id ? { ...c, label: newLabel } : c))
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)

        if (active.data.current?.type === "Column") {
            setActiveColumn(active.data.current.column)
            return
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        if (!active.data.current?.sortable && active.data.current?.type !== "Column") {
            // It's a Lead
            const isActiveLead = leads.find(l => l.id === activeId)
            const isOverLead = leads.find(l => l.id === overId)

            if (!isActiveLead) return

            // If over is a lead, we might want to reorder (not implemented deep reorder yet, just status switch)
            // Or if over is a column
            const overColumnId = localColumns.find(c => c.id === overId)?.id

            let newStatus = isActiveLead.status

            if (overColumnId) {
                newStatus = overColumnId
            } else if (isOverLead) {
                newStatus = isOverLead.status
            }

            if (isActiveLead.status !== newStatus) {
                setLeads((items) => items.map(l =>
                    l.id === activeId ? { ...l, status: newStatus } : l
                ))
            }
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null)
        setActiveColumn(null)

        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        // Column Reorder
        if (active.data.current?.type === "Column") {
            setLocalColumns((items) => {
                const oldIndex = items.findIndex((i) => i.id === activeId)
                const newIndex = items.findIndex((i) => i.id === overId)
                const newCols = arrayMove(items, oldIndex, newIndex)
                // Save async
                if (activeWorkspace) updateWorkspaceKanbanColumns(activeWorkspace.id, newCols)
                return newCols
            })
            return
        }

        // Lead Status Update (Final Commit)
        const activeLead = leads.find(l => l.id === activeId)
        if (activeLead) {
            try {
                await updateLeadStatus(activeId, activeLead.status)
            } catch (error) {
                console.error("Failed to update lead status", error)
            }
        }
    }

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null

    // Panning Logic
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const isDraggingRef = useRef(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('button') || target.closest('input') || target.closest('[data-no-drag]')) return

        isDraggingRef.current = true
        setIsDragging(true)
        if (scrollContainerRef.current) {
            setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
            setScrollLeft(scrollContainerRef.current.scrollLeft)
        }
    }

    const handleMouseLeave = () => {
        isDraggingRef.current = false
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        isDraggingRef.current = false
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollContainerRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div
                    ref={scrollContainerRef}
                    className={cn(
                        "flex h-full gap-4 overflow-x-auto pb-4 px-4 items-start transition-all",
                        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    <SortableContext items={localColumns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        {localColumns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                status={col}
                                leads={leads.filter(l => l.status === col.id)}
                                onLeadClick={setSelectedLead}
                                onDelete={() => handleDeleteColumn(col.id)}
                                onRename={(val) => handleRenameColumn(col.id, val)}
                            />
                        ))}
                    </SortableContext>

                    {/* Add Column Button */}
                    <div className="min-w-[340px] px-2" data-no-drag>
                        <Button variant="outline" className="w-full border-dashed h-12" onClick={handleAddColumn}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
                        </Button>
                    </div>
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.4' },
                        },
                    }),
                }}>
                    {activeColumn ? (
                        <KanbanColumn
                            status={activeColumn}
                            leads={leads.filter(l => l.status === activeColumn.id)}
                            onLeadClick={() => { }}
                            isOverlay
                        />
                    ) : activeLead ? (
                        <div className="rotate-3 scale-105 cursor-grabbing shadow-2xl w-[320px]">
                            <LeadCard lead={activeLead} isOverlay />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext >

            <LeadDetailsSheet
                lead={selectedLead}
                open={!!selectedLead}
                onOpenChange={(open) => !open && setSelectedLead(null)}
            />
        </div>
    )
}


interface KanbanColumnProps {
    status: KanbanColumn
    leads: Lead[]
    onLeadClick: (lead: Lead) => void
    onDelete?: () => void
    onRename?: (newLabel: string) => void
    isOverlay?: boolean
}

function KanbanColumn({ status, leads, onLeadClick, onDelete, onRename, isOverlay }: KanbanColumnProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: status.id,
        data: {
            type: "Column",
            column: status
        }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const [isEditing, setIsEditing] = useState(false)
    const [editLabel, setEditLabel] = useState(status.label)

    const handleSaveLabel = () => {
        setIsEditing(false)
        if (editLabel !== status.label && onRename) {
            onRename(editLabel)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveLabel()
        }
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="flex h-full w-[340px] min-w-[340px] flex-col gap-3 opacity-30 border-2 border-dashed border-primary/20 rounded-xl" />
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="flex h-full w-[340px] min-w-[340px] flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1 group/header">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-foreground text-muted-foreground transition-colors">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    <span className={cn("flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white shadow-sm shrink-0", status.color)}>
                        {leads.length}
                    </span>

                    {isEditing ? (
                        <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onBlur={handleSaveLabel}
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm font-bold bg-background/50"
                            autoFocus
                        />
                    ) : (
                        <div
                            className="font-bold text-sm tracking-tight text-foreground/80 truncate cursor-text hover:bg-muted/50 rounded px-1 py-0.5 flex-1"
                            onClick={() => {
                                setEditLabel(status.label)
                                setIsEditing(true)
                            }}
                        >
                            {status.label}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Pencil className="w-4 h-4 mr-2" /> Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Body */}
            <div className={cn("flex-1 p-2 rounded-2xl border border-transparent transition-colors", status.bg)}>
                <ScrollArea className="h-full -mr-3 pr-3">
                    <div className="flex flex-col gap-3 pb-4 min-h-[100px]">
                        {leads.map(lead => (
                            <DraggableLeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

function DraggableLeadCard({ lead, onClick }: { lead: Lead, onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-0">
                <LeadCard lead={lead} />
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="group outline-none"
            onClick={onClick}
        >
            <LeadCard lead={lead} />
        </div>
    )
}

function LeadCard({ lead, isOverlay }: { lead: Lead, isOverlay?: boolean }) {
    let scoreColor = "text-muted-foreground bg-muted"
    if (lead.score >= 70) scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
    else if (lead.score >= 30) scoreColor = "text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
    else scoreColor = "text-red-700 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"

    const initials = lead.name?.substring(0, 2).toUpperCase() || "??"

    return (
        <Card className={cn(
            "relative overflow-hidden border-0 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 ring-1 ring-border/50",
            isOverlay && "shadow-xl ring-2 ring-primary/20 scale-105"
        )}>
            {/* Score Strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1",
                lead.score >= 70 ? "bg-emerald-500" :
                    lead.score >= 30 ? "bg-amber-500" : "bg-red-400"
            )} />

            <CardContent className="p-3.5 pl-5 space-y-3">
                {/* Header: Avatar + Name + Score */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm shrink-0">
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-muted-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate leading-tight text-foreground/90">
                                {lead.name || "Lead sem nome"}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate font-medium">
                                {lead.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Meta: Company/Job */}
                {(lead.company || lead.job_title) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md border border-border/50">
                        <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">
                            {lead.company}
                            {lead.company && lead.job_title && <span className="mx-1.5 opacity-40">|</span>}
                            <span className="opacity-80">{lead.job_title}</span>
                        </span>
                    </div>
                )}

                {/* Footer: Tags + Score Badge */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        {lead.tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-background/80 hover:bg-background border shadow-sm">
                                {tag}
                            </Badge>
                        ))}
                        {lead.tags && lead.tags.length > 2 && (
                            <span className="text-[9px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-full">
                                +{lead.tags.length - 2}
                            </span>
                        )}
                    </div>

                    <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1", scoreColor)}>
                        {lead.score} pts
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
