"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CreditCard, History, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const CURRENT_USER_ROLE = 'admin'

export function BillingSettings() {
    if (CURRENT_USER_ROLE !== 'admin') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acesso Negado</AlertTitle>
                <AlertDescription>
                    Você não tem permissão para visualizar informações financeiras. Contate o administrador do workspace.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="relative overflow-hidden border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Plano Atual
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight mb-1">Pro</div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Renova em 01/02/2026
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Status
                        </CardTitle>
                        <div className="bg-emerald-500/10 p-1 rounded-md">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500 tracking-tight mb-1">Ativo</div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Pagamento em dia
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border/0 shadow-sm bg-primary text-primary-foreground group cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-primary-foreground/90">
                            Upgrade
                        </CardTitle>
                        <Zap className="h-4 w-4 text-primary-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold tracking-tight mb-1">Enterprise</div>
                        <p className="text-xs text-primary-foreground/80 font-medium group-hover:underline">
                            Conheça os benefícios &rarr;
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Histórico de Pagamentos
                    </CardTitle>
                    <CardDescription>
                        Veja suas faturas e recibos anteriores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-transparent hover:bg-muted/30 rounded-lg transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted group-hover:bg-background border border-transparent group-hover:border-border/50 transition-colors">
                                        <span className="text-xs font-bold text-muted-foreground">PDF</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">Fatura #{1000 + i}</div>
                                        <div className="text-xs text-muted-foreground">01/0{i}/2026</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-sm font-medium">R$ 97,00</div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Download</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
