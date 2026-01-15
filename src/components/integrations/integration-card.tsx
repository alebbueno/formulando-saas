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
}

interface IntegrationCardProps {
    integration: Integration
    onClick: () => void
}

export function IntegrationCard({ integration, onClick }: IntegrationCardProps) {
    return (
        <Card
            className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50"
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <div className="p-2.5 bg-gradient-to-br from-muted to-muted/50 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border/50">
                    <integration.icon className="h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors" />
                </div>
                {integration.status === 'connected' && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Conectado</Badge>
                )}
                {integration.status === 'beta' && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Beta</Badge>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{integration.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                    {integration.description}
                </CardDescription>
            </CardContent>
        </Card>
    )
}
