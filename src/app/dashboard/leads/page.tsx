import { Suspense } from "react"
import { getLeads } from "@/actions/leads"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadsKanban } from "@/components/dashboard/leads/LeadsKanban"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog"

export default async function LeadsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Resolve search params
    const resolvedSearchParams = await searchParams
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined
    const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined

    const { getActiveWorkspace } = await import("@/lib/get-active-workspace")
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    // Determine limit based on view? 
    // For Kanban we might want more leads.
    // simpler: fetch 50 for now to populate board well enough.
    const { leads, total, totalPages } = await getLeads({
        page,
        pageSize: 50,
        search,
        status,
        workspaceId: activeWorkspace.id
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-full flex flex-col">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex items-center space-x-2">
                    <CreateLeadDialog />
                </div>
            </div>

            <Tabs defaultValue="kanban" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        <TabsTrigger value="list">Lista</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar leads..."
                            className="pl-8"
                            defaultValue={search}
                        // Note: Search handling is minimal/mocked for now as we are inside server component without client interaction for this specific input in this snippet
                        />
                    </div>
                </div>

                <TabsContent value="kanban" className="flex-1 h-full overflow-hidden">
                    <LeadsKanban initialLeads={leads} />
                </TabsContent>

                <TabsContent value="list" className="h-[calc(100%-2rem)]">
                    <LeadsTable leads={leads} totalPages={totalPages} currentPage={page} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
