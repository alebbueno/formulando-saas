import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MousePointerClick, TrendingUp } from "lucide-react"

interface AccountStatsProps {
    totalLeads: number
    activeForms: number
    totalViews: number
    conversionRate: number | string
}

export function AccountStats({ totalLeads, activeForms, totalViews, conversionRate }: AccountStatsProps) {
    console.log({ totalLeads, activeForms, totalViews, conversionRate })
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de Leads
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalLeads}</div>
                    <p className="text-xs text-muted-foreground">
                        Em todos os workspaces
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Formulários Ativos
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeForms}</div>
                    <p className="text-xs text-muted-foreground">
                        Projetos criados
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Visualizações
                    </CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalViews}</div>
                    <p className="text-xs text-muted-foreground">
                        Total acumulado
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Taxa de Conversão
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        Média global
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
