"use client"

import { useState, useTransition, useEffect } from "react"
import { getLeads, Lead } from "@/actions/leads"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadDetailsSheet } from "@/components/leads/lead-details-sheet"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ProjectLeadsClientProps {
    initialLeads: Lead[]
    projectId: string
    initialTotal: number
}

export function ProjectLeadsClient({ initialLeads, projectId, initialTotal }: ProjectLeadsClientProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [isPending, startTransition] = useTransition()

    // Filters and Search State
    const [search, setSearch] = useState("")
    const [orderBy, setOrderBy] = useState<'created_at' | 'project_id'>("created_at")
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>("desc")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 10))

    // Details Sheet State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const fetchLeads = () => {
        startTransition(async () => {
            try {
                const result = await getLeads({
                    projectId,
                    search,
                    orderBy,
                    orderDirection,
                    page,
                    pageSize: 10
                })
                setLeads(result.leads)
                setTotalPages(result.totalPages)
            } catch (error) {
                console.error("Failed to fetch leads", error)
            }
        })
    }

    // Debounce search or fetch on effect
    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchLeads()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, orderBy, orderDirection, page])

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Refine sua busca por leads</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nome, email ou telefone..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1) // Reset to page 1 on search
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ordenar por</label>
                            <Select
                                value={orderBy}
                                onValueChange={(val: any) => setOrderBy(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Data de criação</SelectItem>
                                    <SelectItem value="project_id">Formulário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ordem</label>
                            <Select
                                value={orderDirection}
                                onValueChange={(val: any) => setOrderDirection(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Mais recentes primeiro</SelectItem>
                                    <SelectItem value="asc">Mais antigos primeiro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="relative min-h-[400px]">
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <LeadsTable leads={leads} onViewDetails={handleViewDetails} />

                {/* Pagination Controls */}
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isPending}
                    >
                        Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Página {page} de {Math.max(1, totalPages)}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages || isPending}
                    >
                        Próxima
                    </Button>
                </div>
            </div>

            <LeadDetailsSheet
                lead={selectedLead}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    )
}
