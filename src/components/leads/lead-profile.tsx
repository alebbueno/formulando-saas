
"use client"

import { Lead } from "@/actions/leads"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Building2, Mail, MapPin, Globe, Calendar, Tag, TrendingUp, Hash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LeadProfileProps {
    lead: Lead
}

export function LeadProfile({ lead }: LeadProfileProps) {
    const initials = lead.name?.substring(0, 2).toUpperCase() || "??"

    let scoreColor = "text-muted-foreground bg-muted"
    if (lead.score >= 70) scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-200"
    else if (lead.score >= 30) scoreColor = "text-amber-700 bg-amber-50 border-amber-200"
    else scoreColor = "text-red-700 bg-red-50 border-red-200"

    return (
        <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            <div className="h-24 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-pink-900/40" />
            <div className="px-6 -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>

            <CardContent className="px-6 pb-6 space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">{lead.name || "Sem nome"}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">{lead.email}</a>
                    </div>
                </div>

                {/* Score & Status */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold shadow-sm ${scoreColor}`}>
                        <TrendingUp className="w-4 h-4" />
                        {lead.score} <span className="text-[10px] font-normal uppercase opacity-70">Score</span>
                    </div>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                        {lead.status}
                    </Badge>
                </div>

                <Separator />

                {/* Professional Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" />
                        Profissional
                    </h3>
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <span className="text-sm text-muted-foreground">Empresa</span>
                            <span className="text-sm font-medium">{lead.company || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <span className="text-sm text-muted-foreground">Cargo</span>
                            <span className="text-sm font-medium">{lead.job_title || "-"}</span>
                        </div>
                    </div>
                </div>

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
                                {Object.entries(lead.custom_fields).map(([key, value]) => (
                                    <div key={key} className="flex flex-col p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors">
                                        <span className="text-xs text-muted-foreground font-medium uppercase mb-1">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-sm font-medium break-words leading-relaxed">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium hover:bg-secondary/80">
                                        {tag}
                                    </Badge>
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
