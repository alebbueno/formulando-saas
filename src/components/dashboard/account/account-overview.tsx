"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink, MoreVertical } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define a type for Workspace based on what we expected from DB
interface Workspace {
    id: string
    name: string
    created_at: string
    // add other fields as necessary
}

import { AccountStats } from "./account-stats"
import { AccountCharts } from "./account-charts"
import { getAccountStats } from "../../../app/dashboard/account/account-actions"

export function AccountOverview() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        async function loadWorkspaces() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Fetch workspaces
                const { data, error } = await supabase
                    .from('workspaces')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    setWorkspaces(data)
                }
            } catch (err) {
                console.error("Erro ao carregar workspaces", err)
            } finally {
                setIsLoading(false)
            }
        }

        async function loadStats() {
            try {
                const statsData = await getAccountStats()
                setStats(statsData)
            } catch (err) {
                console.error("Failed to load stats", err)
            }
        }

        loadWorkspaces()
        loadStats()
    }, [])

    if (isLoading) {
        return (
            // ... (existing code or simplified skeleton)
            <div className="space-y-6">
                <Skeleton className="h-[100px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AccountStats
                totalLeads={stats?.totalLeads || 0}
                activeForms={stats?.activeForms || 0}
                totalViews={stats?.totalViews || 0}
                conversionRate={stats?.conversionRate || 0}
            />
            <AccountCharts
                leadsGrowthData={stats?.leadsGrowthData || []}
                workspaceDistributionData={stats?.workspaceDistributionData || []}
            />

            <div className="flex items-center justify-between pt-4">
                <div>
                    <h3 className="text-lg font-medium">Seus Workspaces</h3>
                    <p className="text-sm text-muted-foreground">
                        Acesse e gerencie suas áreas de trabalho.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Workspace
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map(workspace => (
                    <Card key={workspace.id} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={`https://avatar.vercel.sh/${workspace.id}.png`} alt={workspace.name} />
                                    <AvatarFallback>{workspace.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold leading-none">
                                        {workspace.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Criado em {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
                                    </CardDescription>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Sair do Workspace</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                    Plano Gratuito
                                </Badge>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700">
                                    Ativo
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button variant="secondary" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                                <Link href={`/dashboard?workspace=${workspace.id}`}>
                                    Acessar Painel
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {workspaces.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Plus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Nenhum workspace encontrado</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                        Você ainda não faz parte de nenhum workspace. Crie um novo para começar a gerenciar seus projetos.
                    </p>
                    <Button>Criar Primeiro Workspace</Button>
                </div>
            )}
        </div>
    )
}
