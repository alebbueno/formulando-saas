"use client"

import { useState } from "react"
import { analyzeLeadWithAI, Lead, updateLeadScore, addLeadTags } from "@/actions/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, CheckCircle2, PlusCircle, Check } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LeadAIAnalysisProps {
    lead: Lead
}

export function LeadAIAnalysis({ lead }: LeadAIAnalysisProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    // Check if analysis already exists
    const hasAnalysis = !!lead.ai_analysis

    const handleAnalyze = async () => {
        setIsLoading(true)
        try {
            await analyzeLeadWithAI(lead.id)
            toast.success("Análise de IA concluída!")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao analisar lead. Verifique se a chave de API está configurada.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptScore = async (newScore: number) => {
        setIsUpdating(true)
        try {
            await updateLeadScore(lead.id, newScore, lead.ai_analysis?.explanation)
            toast.success("Score atualizado com sucesso!")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao atualizar score")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleAddTags = async (tags: string[]) => {
        setIsUpdating(true)
        try {
            await addLeadTags(lead.id, tags)
            toast.success("Tags adicionadas com sucesso!")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao adicionar tags")
        } finally {
            setIsUpdating(false)
        }
    }

    if (!hasAnalysis) {
        return (
            <Card className="border border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10">
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/50 dark:text-indigo-300">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-indigo-950 dark:text-indigo-100">Análise Inteligente</h4>
                            <p className="text-xs text-muted-foreground">Obtenha insights e explicação do score com IA.</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analisar Lead
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const analysis = lead.ai_analysis!

    // Support new and old schema (fallback)
    const explanation = analysis.marketing_summary || analysis.explanation
    const tags = analysis.tags || analysis.suggested_tags || []
    const adjustedScore = analysis.score_final || analysis.adjusted_score
    const reason = analysis.score_adjustment_reason
    const temperature = analysis.lead_temperature

    // Filter out tags that the lead already has
    const newTags = tags.filter(tag => !lead.tags.includes(tag))
    const showTagsAction = newTags.length > 0

    // Check if score is different
    const showScoreAction = adjustedScore && adjustedScore !== lead.score

    return (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background overflow-hidden relative transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-indigo-600" />
            </div>

            <CardHeader className="pb-2 border-b border-indigo-100 dark:border-indigo-800/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        Insights da IA
                        {temperature && (
                            <Badge variant={temperature === 'quente' ? 'default' : temperature === 'morno' ? 'secondary' : 'outline'} className={`ml-2 capitalize ${temperature === 'quente' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}>
                                {temperature}
                            </Badge>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-400 hover:text-indigo-600"
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        title="Reanalisar"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

                {explanation && (
                    <div className="text-sm text-indigo-950/80 dark:text-indigo-100/80 leading-relaxed font-medium">
                        "{explanation}"
                    </div>
                )}

                {(tags.length > 0) && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Tags Sugeridas</span>
                            {showTagsAction && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-2 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                                    onClick={() => handleAddTags(newTags)}
                                    disabled={isUpdating}
                                >
                                    <PlusCircle className="w-3 h-3 mr-1" />
                                    Adicionar Tags
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag: string) => {
                                const isNew = !lead.tags.includes(tag)
                                return (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className={`
                                            border-indigo-200 
                                            ${isNew ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-muted text-muted-foreground opacity-60'}
                                        `}
                                    >
                                        {tag}
                                        {!isNew && <Check className="w-3 h-3 ml-1" />}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                )}

                {showScoreAction && (
                    <div className="flex items-center justify-between gap-2 bg-indigo-100/50 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs text-indigo-900 dark:text-indigo-200">
                                    IA sugere ajuste de score para <strong>{adjustedScore}</strong>.
                                </span>
                            </div>
                            {reason && <span className="text-[10px] text-indigo-700 pl-6">{reason}</span>}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => handleAcceptScore(adjustedScore!)}
                            disabled={isUpdating}
                        >
                            Aceitar
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
