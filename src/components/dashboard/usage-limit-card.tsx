"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface UsageLimitCardProps {
    current: number
    limit: number
    label: string
    unit: string
    planSlug: string
}

export function UsageLimitCard({ current, limit, label, unit, planSlug }: UsageLimitCardProps) {
    const isFree = planSlug === 'free'
    const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0
    const isNearLimit = percentage >= 80 && percentage < 100
    const isAtLimit = percentage >= 100

    // If limit is -1 or very high, we don't necessarily need to show the limit card
    // but if the user requested it for "free" plan, we check isFree
    if (!isFree && limit === -1) return null

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300",
            isAtLimit ? "border-destructive/50 bg-destructive/5" : "border-primary/10 bg-primary/5"
        )}>
            <CardContent className="p-4 flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground/80 lowercase">{label}</span>
                            {isAtLimit && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        </div>
                        <span className={cn(
                            "font-bold",
                            isAtLimit ? "text-destructive" : "text-primary"
                        )}>
                            {current} / {limit === -1 ? "∞" : limit} <span className="text-[10px] text-muted-foreground uppercase ml-0.5">{unit}</span>
                        </span>
                    </div>
                    <Progress
                        value={limit === -1 ? 100 : percentage}
                        className="h-2"
                        indicatorClassName={cn(
                            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-orange-500" : "bg-primary"
                        )}
                    />
                </div>

                {isFree && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary whitespace-nowrap shrink-0"
                        asChild
                    >
                        <Link href="/dashboard/plans">
                            <Zap className="h-3 w-3 fill-primary" />
                            Upgrade
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
