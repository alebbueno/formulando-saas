"use client"

import { useState } from "react"
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from "@dnd-kit/core"
import { Lead, updateLeadStatus } from "@/actions/leads"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Building2, MoreHorizontal, Calendar, TrendingUp } from "lucide-react"
import { LeadDetailsSheet } from "@/components/leads/lead-details-sheet"

const STATUSES = [
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
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string
        const activeLead = leads.find(l => l.id === activeId)
        if (!activeLead) return

        let newStatus = activeLead.status
        const overStatusId = STATUSES.find(s => s.id === overId)?.id

        if (overStatusId) {
            newStatus = overStatusId
        } else {
            const overLead = leads.find(l => l.id === overId)
            if (overLead) {
                newStatus = overLead.status
            }
        }

        if (activeLead.status !== newStatus) {
            setLeads(leads.map(l =>
                l.id === activeId ? { ...l, status: newStatus } : l
            ))

            try {
                await updateLeadStatus(activeId, newStatus)
            } catch (error) {
                console.error("Failed to update lead status", error)
            }
        }

        setActiveId(null)
    }

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-6 overflow-x-auto pb-4 px-4">
                    {STATUSES.map(status => (
                        <KanbanColumn
                            key={status.id}
                            status={status}
                            leads={leads.filter(l => l.status === status.id)}
                            onLeadClick={setSelectedLead}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.4' },
                        },
                    }),
                }}>
                    {activeLead ? (
                        <div className="rotate-3 scale-105 cursor-grabbing shadow-2xl">
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
        </>
    )
}

function KanbanColumn({ status, leads, onLeadClick }: { status: typeof STATUSES[0], leads: Lead[], onLeadClick: (lead: Lead) => void }) {
    const { setNodeRef } = useDroppable({ id: status.id })

    const totalScore = leads.reduce((acc, lead) => acc + lead.score, 0)
    const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0

    return (
        <div ref={setNodeRef} className="flex h-full w-[340px] min-w-[340px] flex-col gap-3">
            {/* Header Clean */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <span className={cn("flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white shadow-sm", status.color)}>
                        {leads.length}
                    </span>
                    <h3 className="font-bold text-sm tracking-tight text-foreground/80">{status.label}</h3>
                </div>
                {leads.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>Avg: {avgScore}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className={cn("flex-1 p-2 rounded-2xl border border-transparent transition-colors", status.bg)}>
                <ScrollArea className="h-full -mr-3 pr-3">
                    <div className="flex flex-col gap-3 pb-4">
                        {leads.map(lead => (
                            <DraggableLeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                        ))}
                        {leads.length === 0 && (
                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-xl">
                                <span className="text-xs text-muted-foreground/40 font-medium">Vazio</span>
                            </div>
                        )}
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
