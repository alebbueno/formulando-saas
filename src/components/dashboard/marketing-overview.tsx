"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, TrendingUp, Trophy, Activity, FireExtinguisher, Flame } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MarketingOverviewProps {
    stats: {
        total: number
        qualified: number
        byStatus: { status: string, count: number }[]
        hotLeads: any[]
    }
}

export function MarketingOverview({ stats }: MarketingOverviewProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-background to-muted/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Base total de ctt.</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50/50 to-background border-emerald-100/50 dark:from-emerald-950/20 dark:border-emerald-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Leads Qualificados</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{stats.qualified}</div>
                        <p className="text-xs text-emerald-700/60 dark:text-emerald-400/60">
                            {stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0}% da base
                        </p>
                    </CardContent>
                </Card>
                {stats.byStatus.slice(0, 2).map((status) => (
                    <Card key={status.status}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{status.status}</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{status.count}</div>
                            <p className="text-xs text-muted-foreground">{status.status}</p>
                        </CardContent>
                    </Card>
                ))}
                {/* Fill empty spots if less than 2 statuses */}
                {/* Fill empty spots if less than 2 statuses */}
                {stats.byStatus.length < 2 && (
                    <Card className="relative overflow-hidden group border-purple-100 dark:border-purple-900/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Ativar Automação</CardTitle>
                            <div className="h-4 w-4 text-purple-600 dark:text-purple-400">
                                <Activity className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">IA</div>
                            <p className="text-xs text-muted-foreground mb-1">Qualifique leads 24/7</p>
                            <Link href="/dashboard/automations" className="text-[10px] text-purple-600 font-medium hover:underline flex items-center gap-1">
                                Configurar agora →
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    Leads Quentes 🔥
                                </CardTitle>
                                <CardDescription>Estes leads estão prontos para fechamento.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.hotLeads.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                Nenhum lead "quente" (&gt;70 pts) identificado ainda.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.hotLeads.map(lead => (
                                    <Link href={`/dashboard/leads/${lead.id}`} key={lead.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border-2 border-orange-100 group-hover:border-orange-200">
                                                <AvatarFallback className="bg-orange-50 text-orange-700 font-bold">{lead.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{lead.company || "Empresa n/a"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className="hidden sm:flex border-orange-200 bg-orange-50 text-orange-800">
                                                {lead.status}
                                            </Badge>
                                            <div className="flex flex-col items-end min-w-[3rem]">
                                                <span className="text-lg font-bold text-orange-600">{lead.score}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">pts</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Funil de Conversão</CardTitle>
                        <CardDescription>Visão simplificada.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.byStatus.map((item, index) => (
                                <div key={item.status} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.status}</span>
                                        <span className="text-muted-foreground">{item.count} leads</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][index % 4]} opacity-80`}
                                            style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {stats.byStatus.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sem dados para exibir.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
