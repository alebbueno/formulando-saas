"use client"

import { useEffect, useState } from "react"
import { useWorkspace } from "@/context/workspace-context"
import { getWorkspaceUsage } from "@/actions/usage"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function UsageSidebar() {
    const { activeWorkspace } = useWorkspace()
    const [usageData, setUsageData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!activeWorkspace) return

        async function fetchUsage() {
            setLoading(true)
            try {
                const data = await getWorkspaceUsage(activeWorkspace!.id)
                setUsageData(data)
            } catch (error) {
                console.error("Failed to fetch usage", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsage()
    }, [activeWorkspace])

    if (!activeWorkspace || !usageData) {
        if (loading) return <div className="px-4 py-4"><Skeleton className="h-20 w-full" /></div>
        return null
    }

    // Only show for admins/owners
    if (usageData.role !== 'owner' && usageData.role !== 'admin') {
        return null
    }

    const { plan, usage } = usageData
    const percentage = Math.min(100, (usage.leads / usage.leadsLimit) * 100)
    const isFree = plan.slug === 'free'
    const isAgency = plan.slug === 'agency-pro'

    return (
        <div className="px-3 py-4 mt-auto border-t bg-muted/20">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Plano {plan.name}
                    </span>
                    {isFree && (
                        <Link href="/dashboard/plans">
                            <span className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                                Upgrade
                            </span>
                        </Link>
                    )}
                </div>

                {!isAgency ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Leads/mês</span>
                            <span className={percentage > 90 ? "text-red-500 font-bold" : ""}>
                                {usage.leads} / {usage.leadsLimit}
                            </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Leads/mês</span>
                            <span className="text-primary font-bold">Ilimitado</span>
                        </div>
                        <Progress value={100} className="h-2 bg-primary/20" />
                    </div>
                )}

                {(isFree || percentage > 80) && (
                    <Button variant="outline" size="sm" className="w-full text-xs gap-2 h-8 border-primary/20 hover:bg-primary/5 hover:text-primary" asChild>
                        <Link href="/dashboard/plans">
                            <Zap className="h-3 w-3" />
                            Fazer Upgrade
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
