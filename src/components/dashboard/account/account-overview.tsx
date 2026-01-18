"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, ExternalLink, MoreVertical, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

import { AccountStats } from "./account-stats"
import { AccountCharts } from "./account-charts"
import { getAccountStats } from "../../../app/dashboard/account/account-actions"
import { getOwnerWorkspacesWithUsage } from "@/actions/usage"
import { CreateBrandDialog } from "../create-brand-dialog"
import { deleteWorkspace } from "@/actions/workspaces"
import { useWorkspace } from "@/context/workspace-context"

// Define type based on action return
type WorkspaceWithUsage = Awaited<ReturnType<typeof getOwnerWorkspacesWithUsage>>[number]

export function AccountOverview() {
    const [workspaces, setWorkspaces] = useState<WorkspaceWithUsage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null)
    const { switchWorkspace } = useWorkspace()

    const handleAccess = async (workspaceId: string) => {
        setIsLoading(true)
        await switchWorkspace(workspaceId)
    }

    useEffect(() => {
        async function loadData() {
            try {
                // Parallel fetch
                const [wsData, statsData] = await Promise.all([
                    getOwnerWorkspacesWithUsage(),
                    getAccountStats()
                ])
                setWorkspaces(wsData)
                setStats(statsData)
            } catch (err) {
                console.error("Failed to load account data", err)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const handleDeleteWorkspace = async (id: string) => {
        try {
            const result = await deleteWorkspace(id)
            if (result.success) {
                toast.success("Workspace excluído com sucesso")
                setWorkspaces(prev => prev.filter(w => w.id !== id))
                // Reload to ensure global context (sidebar etc) updates
                window.location.reload()
            }
        } catch (error) {
            toast.error("Erro ao excluir workspace")
            console.error(error)
        } finally {
            setWorkspaceToDelete(null)
        }
    }

    if (isLoading) {
        return (
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
        <div className="space-y-8">
            <CreateBrandDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

            <AlertDialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o workspace,
                            seus formulários, leads e cancelará qualquer assinatura ativa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => workspaceToDelete && handleDeleteWorkspace(workspaceToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sim, excluir workspace
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Workspaces Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Seus Workspaces</h3>
                        <p className="text-sm text-muted-foreground">
                            Gerencie seus planos e limites por workspace.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Workspace
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map(workspace => {
                        const usagePercent = Math.min(100, (workspace.usage.leads / workspace.usage.limit) * 100)
                        const isAgency = workspace.plan?.slug === 'agency-pro'

                        return (
                            <Card key={workspace.id} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md flex flex-col">
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
                                                {workspace.plan?.name || "Gratuito"}
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
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/plans?workspace=${workspace.id}`}>Alterar Plano</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onSelect={(e) => {
                                                    e.preventDefault() // Prevent closing immediately if needed, mainly for dialog stability
                                                    setWorkspaceToDelete(workspace.id)
                                                }}
                                            >
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="pb-2 flex-1">
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">Uso de Leads</span>
                                            <span className={usagePercent > 90 && !isAgency ? "text-red-500 font-bold" : "text-muted-foreground"}>
                                                {isAgency ? "Ilimitado" : `${workspace.usage.leads} / ${workspace.usage.limit}`}
                                            </span>
                                        </div>
                                        <Progress value={isAgency ? 1 : usagePercent} className={isAgency ? "bg-primary/20" : ""} />

                                        <div className="flex items-center gap-2 pt-2">
                                            <Badge variant={workspace.subscription_status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                {workspace.subscription_status === 'active' ? 'Ativo' : 'Grátis'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t bg-muted/5">
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="secondary"
                                            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                            onClick={() => handleAccess(workspace.id)}
                                        >
                                            Acessar
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                        {(workspace.plan?.slug === 'free' || usagePercent > 80) && !isAgency && (
                                            <Button variant="outline" size="icon" className="shrink-0 border-primary/20 text-primary hover:bg-primary/10" title="Fazer Upgrade" asChild>
                                                <Link href="/dashboard/plans">
                                                    <Zap className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                {workspaces.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Plus className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Nenhum workspace encontrado</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                            Crie seu primeiro workspace para começar.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Criar Workspace</Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Stats Section */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Visão Geral da Conta</h3>
                    <p className="text-sm text-muted-foreground">
                        Métricas consolidadas de todos os seus workspaces.
                    </p>
                </div>
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
            </div>
        </div>
    )
}
