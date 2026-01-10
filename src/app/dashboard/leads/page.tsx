import { getLeads, getProjectsList } from "@/actions/leads"
import { LeadsClient } from "./client"

export default async function LeadsPage() {
    // Fetch initial data
    const [{ leads, total, totalPages }, projects] = await Promise.all([
        getLeads({
            page: 1,
            pageSize: 10,
            orderBy: 'created_at',
            orderDirection: 'desc'
        }),
        getProjectsList()
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex items-center space-x-2">
                    {/* Add Export button here later if needed */}
                </div>
            </div>

            <LeadsClient
                initialLeads={leads}
                projects={projects}
                initialTotal={total}
            />
        </div>
    )
}
