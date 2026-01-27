import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { LandingPageList } from "@/components/dashboard/landing-page-list"
import { Button } from "@/components/ui/button"
import { Plus, Layout } from "lucide-react"
import { createLandingPage } from "@/app/dashboard/actions"
import { UsageLimitCard } from "@/components/dashboard/usage-limit-card"
import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getWorkspaceUsage } from "@/actions/usage"

export default async function LandingPagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Usuário não autenticado</div>
    }

    const { activeWorkspace } = await getActiveWorkspace() || {}
    const usageData = activeWorkspace ? await getWorkspaceUsage(activeWorkspace.id) : null

    let landingPages: any[] = []

    if (activeWorkspace) {
        const { data } = await supabase
            .from("landing_pages")
            .select("*")
            .eq("workspace_id", activeWorkspace.id)
            .order("created_at", { ascending: false })

        if (data) landingPages = data
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Landing Pages</h2>
                <div className="flex items-center gap-4">
                    {usageData && usageData.plan.slug === 'free' && (
                        <div className="min-w-[300px]">
                            <UsageLimitCard
                                current={usageData.usage.landingPages}
                                limit={usageData.usage.landingPagesLimit}
                                label="Landing Pages"
                                unit="unid"
                                planSlug={usageData.plan.slug}
                            />
                        </div>
                    )}
                    <form action={createLandingPage}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Landing Page
                        </Button>
                    </form>
                </div>
            </div>

            {landingPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 md:p-16 animate-in fade-in-50 mt-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Layout className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold">Nenhuma Landing Page ainda</h3>
                    <p className="mt-2 text-sm text-muted-foreground mb-4">
                        Crie sua primeira página de alta conversão.
                    </p>
                    <form action={createLandingPage}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Landing Page
                        </Button>
                    </form>
                </div>
            ) : (
                <LandingPageList landingPages={landingPages} />
            )}
        </div>
    )
}
