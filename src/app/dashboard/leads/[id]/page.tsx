import { getLead, getLeadEvents } from "@/actions/leads"
import { LeadProfile } from "@/components/leads/lead-profile"
import { LeadTimeline } from "@/components/leads/lead-timeline"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Home, LayoutDashboard, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const lead = await getLead(id)

    if (!lead) {
        notFound()
    }

    const events = await getLeadEvents(id)

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-muted/5 min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col gap-4">
                <nav className="flex items-center text-sm text-muted-foreground">
                    <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
                        <Home className="h-3.5 w-3.5 mr-1" />
                        Dashboard
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
                    <Link href="/dashboard/leads" className="flex items-center hover:text-foreground transition-colors">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Leads
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
                    <span className="font-medium text-foreground truncate max-w-[200px]">{lead.name || "Detalhes"}</span>
                </nav>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm bg-background" asChild>
                            <Link href="/dashboard/leads">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Visão Geral do Lead
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Profile Card (Sticky) */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                    <LeadProfile lead={lead} />
                </div>

                {/* Right Column: Timeline & Activities */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent pointer-events-none h-12 z-10" />
                        <LeadTimeline events={events} />
                    </div>
                </div>
            </div>
        </div>
    )
}
