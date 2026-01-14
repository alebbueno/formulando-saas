"use client"

import { useState, useTransition, useEffect } from "react"
import { getSubmissions, Submission } from "@/actions/submissions"
import { SubmissionsTable } from "@/components/submissions/submissions-table"
import { SubmissionDetailsSheet } from "@/components/submissions/submission-details-sheet"
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

interface LeadsClientProps {
    initialSubmissions: Submission[]
    projects: { id: string, name: string }[]
    initialTotal: number
}

export function LeadsClient({ initialSubmissions, projects, initialTotal }: LeadsClientProps) {
    const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
    const [isPending, startTransition] = useTransition()

    // Filters and Search State
    const [search, setSearch] = useState("")
    const [projectId, setProjectId] = useState("all")
    const [orderBy, setOrderBy] = useState<'created_at' | 'project_id'>("created_at")
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>("desc")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1) // Initial total pages logic depends on page size (10)

    // Details Sheet State
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const fetchSubmissions = () => {
        startTransition(async () => {
            try {
                const result = await getSubmissions({
                    projectId,
                    search,
                    orderBy,
                    orderDirection,
                    page,
                    pageSize: 10
                })
                setSubmissions(result.submissions)
                setTotalPages(result.totalPages)
            } catch (error) {
                console.error("Failed to fetch submissions", error)
                // Optionally show error toast
            }
        })
    }

    // Debounce search or fetch on effect
    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchSubmissions()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, projectId, orderBy, orderDirection, page])

    const handleViewDetails = (submission: Submission) => {
        setSelectedSubmission(submission)
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <label className="text-sm font-medium">Formulário</label>
                            <Select
                                value={projectId}
                                onValueChange={(val) => {
                                    setProjectId(val)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os formulários" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os formulários</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

                <SubmissionsTable submissions={submissions} onViewDetails={handleViewDetails} />

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

            <SubmissionDetailsSheet
                submission={selectedSubmission}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    )
}
