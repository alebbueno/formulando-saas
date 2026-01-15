"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CreditCard, ExternalLink, FileText, History, Loader2, ShieldCheck, Zap } from "lucide-react"
import { toast } from "sonner"

import { createCustomerPortalSession, getBillingHistory, getWorkspaceUsage } from "@/actions/billing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useWorkspace } from "@/context/workspace-context"

// ... existing imports ...

export function BillingSettings() {
    const { activeWorkspace } = useWorkspace()
    const [invoices, setInvoices] = useState<any[]>([])
    const [usage, setUsage] = useState({ leads: 0, emails: 0 })
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
    const [isLoadingPortal, setIsLoadingPortal] = useState(false)

    useEffect(() => {
        async function loadData() {
            if (!activeWorkspace?.id) return
            try {
                // Parallel fetch
                const [invoicesData, usageData] = await Promise.all([
                    getBillingHistory(activeWorkspace.id),
                    getWorkspaceUsage(activeWorkspace.id)
                ])
                setInvoices(invoicesData)
                setUsage(usageData)
            } catch (error) {
                console.error("Failed to load billing data", error)
            } finally {
                setIsLoadingInvoices(false)
            }
        }
        loadData()
    }, [activeWorkspace?.id])

    const handleManageSubscription = async () => {
        if (!activeWorkspace?.id) return
        setIsLoadingPortal(true)
        try {
            const url = await createCustomerPortalSession(activeWorkspace.id)
            if (url) window.location.href = url
        } catch (error) {
            toast.error("Erro ao abrir portal de cobrança")
        } finally {
            setIsLoadingPortal(false)
        }
    }

    if (!activeWorkspace) return null

    const isFree = activeWorkspace.plan?.slug === 'free' || !activeWorkspace.plan
    const isOwner = activeWorkspace.role === 'owner'
    // Plan Limits
    const maxLeads = activeWorkspace.plan?.max_leads_per_month || 100 // Default to low if missing to prompt upgrade? Or 0.
    const maxEmails = activeWorkspace.plan?.max_emails_per_month || 0

    // Agency plan has 999999 leads, effectively unlimited.
    const isUnlimitedLeads = maxLeads > 100000
    const leadsPercent = isUnlimitedLeads ? 0 : Math.min(100, (usage.leads / maxLeads) * 100)
    const emailsPercent = maxEmails === 0 ? 0 : Math.min(100, (usage.emails / maxEmails) * 100) // Avoid div by zero

    if (!isOwner) {
        // ... access denied alert ...
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acesso Negado</AlertTitle>
                <AlertDescription>
                    Apenas o proprietário do workspace pode visualizar informações financeiras.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* ... existing cards (Current Plan, Status, Manage) ... */}
                <Card className="relative overflow-hidden border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Plano Atual
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight mb-1 capitalize">
                            {activeWorkspace.plan?.name || "Gratuito"}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                            {isFree ? "Faça upgrade para mais recursos" : "Assinatura ativa"}
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
                        <div className="text-3xl font-bold text-emerald-500 tracking-tight mb-1 capitalize">
                            {activeWorkspace.subscription_status === 'active' ? 'Ativo' :
                                activeWorkspace.subscription_status === 'trialing' ? 'Testes' :
                                    'Inativo'}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                            {activeWorkspace.subscription_status === 'active' ? 'Pagamentos em dia' : 'Verifique sua assinatura'}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="relative overflow-hidden border-border/0 shadow-sm bg-primary text-primary-foreground group cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all"
                    onClick={() => isFree ? window.location.href = `/dashboard/plans?workspace=${activeWorkspace.id}` : handleManageSubscription()}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-primary-foreground/90">
                            {isFree ? "Fazer Upgrade" : "Gerenciar"}
                        </CardTitle>
                        <Zap className="h-4 w-4 text-primary-foreground" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold tracking-tight mb-1">
                            {isFree ? "Desbloquear" : "Assinatura"}
                        </div>
                        <p className="text-xs text-primary-foreground/80 font-medium group-hover:underline flex items-center gap-1">
                            {isLoadingPortal ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <>
                                    {isFree ? "Ver planos disponíveis" : "Acessar portal financeiro"}
                                    <ExternalLink className="h-3 w-3" />
                                </>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Progress Section - Only if not free (or just show limits for everyone to encourage upgrade?) User request: "se tem plano" */}
            {!isFree && (
                <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Consumo do Plano</CardTitle>
                        <CardDescription>Acompanhe o uso dos recursos do seu plano atual.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Leads Capturados (Mês)</span>
                                <span className="text-muted-foreground">
                                    {isUnlimitedLeads ? `${usage.leads} / Ilimitado` : `${usage.leads} / ${maxLeads}`}
                                </span>
                            </div>
                            <Progress value={leadsPercent} className="h-2" indicatorClassName={leadsPercent > 90 ? "bg-destructive" : ""} />
                            <p className="text-xs text-muted-foreground">
                                Renovação em: 1º de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Emails Enviados (Mês)</span>
                                <span className="text-muted-foreground">
                                    {usage.emails} / {maxEmails}
                                </span>
                            </div>
                            <Progress value={emailsPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Renovação em: 1º de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    {isLoadingInvoices ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg animate-pulse">
                                    <div className="h-10 w-32 bg-muted rounded" />
                                    <div className="h-8 w-20 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma fatura encontrada.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 bg-transparent hover:bg-muted/30 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted group-hover:bg-background border border-transparent group-hover:border-border/50 transition-colors">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Fatura #{invoice.number}</div>
                                            <div className="text-xs text-muted-foreground">{invoice.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-sm font-medium">{invoice.amount}</div>
                                        <Badge variant={invoice.status === 'paid' ? 'outline' : 'secondary'} className="capitalize">
                                            {invoice.status}
                                        </Badge>
                                        {invoice.pdf && (
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                <a href={invoice.pdf} target="_blank" rel="noopener noreferrer">Download</a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
