"use client"

import { useState, useMemo } from "react"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
    Send, 
    Users, 
    User, 
    AlertCircle, 
    Loader2, 
    Info,
    Layout
} from "lucide-react"
import { sendManualCampaign } from "@/actions/emails"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EmailCampaignFormProps {
    workspaceId: string
    templates: any[]
    domains: any[]
    bases: {
        statuses: string[]
        tags: string[]
    }
    leads: any[]
}

export function EmailCampaignForm({ 
    workspaceId, 
    templates, 
    domains, 
    bases, 
    leads 
}: EmailCampaignFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [templateId, setTemplateId] = useState("")
    const [domainId, setDomainId] = useState("")
    const [senderPrefix, setSenderPrefix] = useState("contato")
    const [targetType, setTargetType] = useState<"all" | "tag" | "status" | "single">("all")
    const [targetValue, setTargetValue] = useState("")
    const [isScheduled, setIsScheduled] = useState(false)
    const [scheduledAt, setScheduledAt] = useState("")
    
    // Derived state
    const selectedTemplate = useMemo(() => 
        templates.find(t => t.id === templateId), 
    [templates, templateId])

    const selectedDomain = useMemo(() => 
        domains.find(d => d.id === domainId), 
    [domains, domainId])

    const filteredLeadsCount = useMemo(() => {
        if (targetType === "all") return leads.length
        if (targetType === "single") return targetValue ? 1 : 0
        if (targetType === "tag") {
            return leads.filter(l => l.tags?.includes(targetValue)).length
        }
        if (targetType === "status") {
            return leads.filter(l => l.status === targetValue).length
        }
        return 0
    }, [targetType, targetValue, leads])

    const canSubmit = templateId && (targetType === "all" || targetValue) && (domains.length > 0 ? domainId : true) && (!isScheduled || scheduledAt)

    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsLoading(true)
        try {
            const result = await sendManualCampaign(
                workspaceId, 
                templateId, 
                {
                    type: targetType,
                    value: targetValue
                }, 
                senderPrefix,
                isScheduled ? scheduledAt : null
            )

            if (result.success) {
                const res = result as any;
                if (isScheduled) {
                    toast.success(`Campanha agendada com sucesso para ${scheduledAt ? new Date(scheduledAt).toLocaleString() : "data definida"}!`)
                } else {
                    toast.success(`Campanha enviada! ${res.sentCount || 0} e-mails entregues.`)
                }
                
                if (res.scheduledCount > 0 && !isScheduled) {
                    toast.info(`${res.scheduledCount} e-mails foram agendados para os próximos dias devido ao limite diário.`)
                }

                if (res.errorCount && res.errorCount > 0) {
                    toast.warning(`${res.errorCount} e-mails falharam. Verifique os logs.`)
                }
                router.push("/dashboard/emails")
            } else {
                toast.error((result as any).error || "Erro ao disparar campanha.")
            }
        } catch (error) {
            toast.error("Ocorreu um erro inesperado.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* 1. Template & Sender */}
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            Configuração do E-mail
                        </CardTitle>
                        <CardDescription>
                            Escolha o que será enviado e quem será o remetente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Template de E-mail</Label>
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label>Prefixo do Remetente</Label>
                                <div className="flex items-center">
                                    <Input 
                                        value={senderPrefix} 
                                        onChange={(e) => setSenderPrefix(e.target.value)}
                                        placeholder="ex: contato"
                                        className="rounded-r-none"
                                    />
                                    <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground whitespace-nowrap">
                                        @{selectedDomain?.domain || "dominio.com"}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Domínio de Envio</Label>
                                <Select value={domainId} onValueChange={setDomainId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um domínio..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {domains.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.domain}
                                            </SelectItem>
                                        ))}
                                        {domains.length === 0 && (
                                            <SelectItem value="none" disabled>
                                                Nenhum domínio verificado
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Target Audience */}
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Público-Alvo
                        </CardTitle>
                        <CardDescription>
                            Selecione para quem você deseja enviar este e-mail.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={targetType} onValueChange={(v: any) => { setTargetType(v); setTargetValue(""); }}>
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="all" className="gap-2">
                                    <Users className="h-4 w-4" /> Todos
                                </TabsTrigger>
                                <TabsTrigger value="tag" className="gap-2">
                                    <Badge variant="outline" className="h-3 w-3 p-0" /> Bases
                                </TabsTrigger>
                                <TabsTrigger value="single" className="gap-2">
                                    <User className="h-4 w-4" /> Lead Único
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4 pt-2">
                                <div className="p-4 bg-muted/30 rounded-lg flex items-start gap-3">
                                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground">
                                        O e-mail será enviado para todos os <strong>{leads.length}</strong> leads cadastrados neste workspace.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="tag" className="space-y-4 pt-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Filtrar por Tag</Label>
                                        <Select value={targetValue} onValueChange={setTargetValue}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma tag..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bases.tags.map(tag => (
                                                    <SelectItem key={tag} value={tag}>
                                                        Tag: {tag}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="text-center text-sm text-muted-foreground">ou</div>

                                    <div className="space-y-2">
                                        <Label>Filtrar por Status</Label>
                                        <Select value={targetValue} onValueChange={(v) => { setTargetType("status"); setTargetValue(v); }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bases.statuses.map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        Status: {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="single" className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Selecionar Lead</Label>
                                    <Select value={targetValue} onValueChange={setTargetValue}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Busque um lead por nome ou email..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leads.slice(0, 50).map(lead => (
                                                <SelectItem key={lead.id} value={lead.id}>
                                                    {lead.name} ({lead.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* 3. Scheduling */}
                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" />
                                Opções de Envio
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="schedule-toggle" className="text-xs font-normal text-muted-foreground mr-1">
                                    Agendar para depois
                                </Label>
                                <div className="flex h-6 items-center">
                                    <input 
                                        type="checkbox" 
                                        id="schedule-toggle"
                                        checked={isScheduled}
                                        onChange={(e) => setIsScheduled(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    {isScheduled && (
                        <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                                <AlertCircle className="h-5 w-5 text-amber-500 float-left mr-3 mt-1" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Configure a data e hora do disparo</p>
                                    <p className="text-xs text-muted-foreground">
                                        Seu envio começará exatamente no horário selecionado. Caso haja mais de 100 leads, o sistema continuará enviando nos dias seguintes.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label>Data e Hora de Início</Label>
                                        <Input 
                                            type="datetime-local" 
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="w-full md:w-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                    {!isScheduled && (
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                O envio será iniciado imediatamente após a confirmação.
                            </p>
                        </CardContent>
                    )}
                </Card>

                {domains.length === 0 && (
                    <Card className="bg-amber-500/10 border-amber-500/20">
                        <CardContent className="pt-6 space-y-2">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                                <AlertCircle className="h-4 w-4" />
                                Domínio de Envio
                            </div>
                            <p className="text-xs text-amber-700">
                                Você não tem domínios verificados. O e-mail será enviado via endereço padrão do sistema.
                            </p>
                            <Button variant="link" asChild className="p-0 h-auto text-amber-700 font-bold">
                                <a href="/dashboard/integrations">Configurar Domínio</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Side Summary */}
            <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5 shadow-md sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Resumo do Disparo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Remetente</span>
                                <span className="font-medium text-foreground truncate max-w-[150px]">
                                    {senderPrefix}@{selectedDomain?.domain || "..."}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Template</span>
                                <span className="font-medium text-foreground truncate max-w-[150px]">
                                    {selectedTemplate?.name || "Nenhum"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Público</span>
                                <Badge variant="secondary" className="font-medium">
                                    {targetType === "all" ? "Todos os Leads" : targetType === "tag" ? "Por Tag" : targetType === "status" ? "Por Status" : "Lead Único"}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Quando</span>
                                <span className={isScheduled ? "text-primary font-bold" : "font-medium text-foreground"}>
                                    {isScheduled ? (scheduledAt ? new Date(scheduledAt).toLocaleDateString() : "Definir data") : "Imediato"}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-primary/10">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Destinatários</span>
                                    <span className="text-primary">{filteredLeadsCount}</span>
                                </div>
                            </div>
                        </div>

                        {selectedTemplate && (
                            <div className="p-3 bg-background rounded-md border border-primary/10 space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground">Assunto do E-mail</Label>
                                <p className="text-xs font-medium line-clamp-2">{selectedTemplate.subject}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button 
                            className="w-full h-12 text-lg gap-2" 
                            disabled={!canSubmit || isLoading || filteredLeadsCount === 0}
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                            {isScheduled ? "Agendar Campanha" : "Disparar Agora"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground px-4">
                            {isScheduled 
                                ? "Os emails serão agendados para processamento automático no horário definido." 
                                : "Ao clicar em disparar, os e-mails serão processados e enviados individualmente imediatamente."
                            }
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
