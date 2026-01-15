import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Integration {
    id: string
    title: string
    description: string
    icon: LucideIcon
    status: 'connected' | 'disconnected' | 'beta'
    category: 'crm' | 'communication' | 'storage' | 'productivity' | 'cms'
    comingSoon?: boolean
}

interface IntegrationCardProps {
    integration: Integration
    onClick: () => void
}

export function IntegrationCard({ integration, onClick }: IntegrationCardProps) {
    const isComingSoon = integration.comingSoon

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                isComingSoon
                    ? "opacity-80 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-lg hover:border-primary/50 group"
            )}
            onClick={isComingSoon ? undefined : onClick}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500",
                !isComingSoon && "group-hover:opacity-100"
            )} />

            {isComingSoon && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-border/50 font-medium px-3 py-1">
                        Em breve
                    </Badge>
                </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <div className={cn(
                    "p-2.5 bg-gradient-to-br from-muted to-muted/50 rounded-xl transition-transform duration-300 shadow-sm border border-border/50",
                    !isComingSoon && "group-hover:scale-110"
                )}>
                    <integration.icon className={cn(
                        "h-6 w-6 text-foreground/80 transition-colors",
                        !isComingSoon && "group-hover:text-primary"
                    )} />
                </div>
                {integration.status === 'connected' && !isComingSoon && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Conectado</Badge>
                )}
                {integration.status === 'beta' && !isComingSoon && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Beta</Badge>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                <CardTitle className={cn(
                    "text-lg font-semibold mb-2 transition-colors",
                    !isComingSoon && "group-hover:text-primary"
                )}>{integration.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                    {integration.description}
                </CardDescription>
            </CardContent>
        </Card>
    )
}
