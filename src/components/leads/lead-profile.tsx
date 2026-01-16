"use client"

import { useState } from "react"
import { Lead, updateLead, updateLeadScore, addLeadTags, removeLeadTag } from "@/actions/leads"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Tag, TrendingUp, Hash, MousePointerClick, ExternalLink, Pencil, X, Plus, Check, Loader2, Save } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface LeadProfileProps {
    lead: Lead
}

export function LeadProfile({ lead }: LeadProfileProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        job_title: lead.job_title || ""
    })

    const [newTag, setNewTag] = useState("")
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [scoreValue, setScoreValue] = useState(lead.score)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateLead(lead.id, formData)
            toast.success("Perfil atualizado")
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            toast.error("Erro ao atualizar perfil")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTag = async () => {
        if (!newTag.trim()) return
        setIsAddingTag(true)
        try {
            await addLeadTags(lead.id, [newTag.trim()])
            toast.success("Tag adicionada")
            setNewTag("")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao adicionar tag")
        } finally {
            setIsAddingTag(false)
        }
    }

    const handleRemoveTag = async (tag: string) => {
        try {
            await removeLeadTag(lead.id, tag)
            toast.success("Tag removida")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao remover tag")
        }
    }

    const handleScoreChange = async (val: number[]) => {
        const newScore = val[0]
        try {
            await updateLeadScore(lead.id, newScore, "Ajuste manual")
            toast.success("Score atualizado")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao atualizar score")
        }
    }

    const initials = lead.name?.substring(0, 2).toUpperCase() || "??"

    let scoreColor = "text-muted-foreground bg-muted"
    if (scoreValue >= 70) scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-200"
    else if (scoreValue >= 30) scoreColor = "text-amber-700 bg-amber-50 border-amber-200"
    else scoreColor = "text-red-700 bg-red-50 border-red-200"

    return (
        <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 group/card relative">
            {/* Edit Toggle */}
            <div className="absolute top-4 right-4 z-10">
                {!isEditing ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" className="h-8 px-3" onClick={() => setIsEditing(false)} disabled={isLoading}>
                            <X className="h-4 w-4 mr-1" /> Cancelar
                        </Button>
                        <Button variant="default" size="sm" className="h-8 px-3" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Salvar
                        </Button>
                    </div>
                )}
            </div>

            <div className="h-24 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-pink-900/40" />

            {/* Avatar & Header */}
            <div className="px-6 -mt-12 mb-4 relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
            </div>

            <CardContent className="px-6 pb-6 space-y-6">
                {/* Header Info */}
                <div className="space-y-3">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold tracking-tight">{lead.name || "Sem nome"}</h2>
                    )}

                    <div className="flex flex-col gap-2">
                        {isEditing ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Email</Label>
                                        <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Telefone</Label>
                                        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-8 text-xs" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">{lead.email}</a>
                                </div>
                                {lead.phone && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3.5 w-3.5" />
                                        <span>{lead.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Section - With Popover for Edit */}
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-muted/50 cursor-pointer hover:bg-muted/30 transition-colors group/score">
                            <div className={`flex flex-col items-center justify-center h-20 w-20 rounded-full border-4 ${scoreColor.replace('bg-', 'border-').split(' ')[2]} bg-background shadow-inner relative`}>
                                <span className={`text-3xl font-bold ${scoreColor.split(' ')[0]}`}>{scoreValue}</span>
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Score</span>
                                <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 opacity-0 group-hover/score:opacity-100 transition-opacity shadow-sm border">
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">Score de Qualificação</h3>
                                    <Badge variant="outline" className={`border-0 ${scoreColor}`}>
                                        {lead.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-tight max-w-[200px]">
                                    {scoreValue >= 70 ? "Alto potencial de conversão." :
                                        scoreValue >= 30 ? "Potencial moderado." :
                                            "Lead frio."}
                                </p>
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Ajustar Score</h4>
                                <p className="text-sm text-muted-foreground">Defina manualmente o score deste lead.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-8 text-center font-bold">{scoreValue}</span>
                                <Slider
                                    value={[scoreValue]}
                                    max={100}
                                    step={5}
                                    onValueChange={(vals) => setScoreValue(vals[0])}
                                    onValueCommit={handleScoreChange}
                                    className="flex-1"
                                />
                                <span className="w-8 text-center text-muted-foreground">100</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator />

                {/* Professional Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" />
                        Profissional
                    </h3>
                    <div className="grid gap-3">
                        {isEditing ? (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Empresa</Label>
                                    <Input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Cargo</Label>
                                    <Input value={formData.job_title} onChange={e => setFormData({ ...formData, job_title: e.target.value })} className="h-8" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <span className="text-sm text-muted-foreground">Empresa</span>
                                    <span className="text-sm font-medium">{lead.company || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <span className="text-sm text-muted-foreground">Cargo</span>
                                    <span className="text-sm font-medium">{lead.job_title || "-"}</span>
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {/* Tags Section */}
                <Separator />
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5" />
                            Tags
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {lead.tags && lead.tags.length > 0 && lead.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="pl-2.5 pr-1 py-0.5 text-xs font-medium hover:bg-secondary/80 flex items-center gap-1 group/tag">
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="w-4 h-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center opacity-0 group-hover/tag:opacity-100 transition-opacity"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </Badge>
                        ))}

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-dashed">
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3" align="start">
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Nova tag..."
                                        className="h-8 text-xs"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleAddTag} disabled={isAddingTag}>
                                        {isAddingTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* UTM Tracking / Campaign Attribution */}
                {(lead.utm_source || lead.utm_campaign || lead.landing_page_url) && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <MousePointerClick className="w-3.5 h-3.5" />
                                Origem do Lead
                            </h3>
                            <div className="grid gap-2">
                                {lead.utm_source && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                                        <span className="text-xs text-muted-foreground font-medium">Fonte</span>
                                        <Badge variant="secondary" className="font-mono text-xs w-fit">
                                            {lead.utm_source}
                                        </Badge>
                                    </div>
                                )}
                                {lead.utm_medium && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
                                        <span className="text-xs text-muted-foreground font-medium">Mídia</span>
                                        <span className="text-sm font-medium font-mono">{lead.utm_medium}</span>
                                    </div>
                                )}
                                {lead.utm_campaign && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
                                        <span className="text-xs text-muted-foreground font-medium">Campanha</span>
                                        <span className="text-sm font-medium font-mono break-words">
                                            {lead.utm_campaign}
                                        </span>
                                    </div>
                                )}
                                {lead.utm_content && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
                                        <span className="text-xs text-muted-foreground font-medium">Conteúdo</span>
                                        <span className="text-sm font-medium font-mono break-words">
                                            {lead.utm_content}
                                        </span>
                                    </div>
                                )}
                                {lead.utm_term && (
                                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
                                        <span className="text-xs text-muted-foreground font-medium">Termo</span>
                                        <span className="text-sm font-medium font-mono break-words">{lead.utm_term}</span>
                                    </div>
                                )}
                                {lead.landing_page_url && (
                                    <div className="flex flex-col p-3 rounded-lg bg-secondary/30 gap-1.5">
                                        <span className="text-xs text-muted-foreground font-medium">Página de Entrada</span>
                                        <a
                                            href={lead.landing_page_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-start gap-1.5 font-mono break-all"
                                        >
                                            <span className="flex-1 leading-relaxed">{lead.landing_page_url}</span>
                                            <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Custom Fields */}
                {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5" />
                                Detalhes Extras
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(lead.custom_fields)
                                    .filter(([key]) => !key.startsWith('_') && !key.startsWith('wpcf7') && key !== 'metadata')
                                    .map(([key, value]) => (
                                        <div key={key} className="flex flex-col p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors">
                                            <span className="text-xs text-muted-foreground font-medium uppercase mb-1">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-medium break-words leading-relaxed">{String(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="pt-2 text-xs text-center text-muted-foreground/60">
                    Lead criado {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
                </div>

            </CardContent>
        </Card>
    )
}
