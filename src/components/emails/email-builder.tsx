"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEmailTemplate, updateEmailTemplate, EmailTemplate } from "@/actions/emails"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MergeTagPicker } from "./merge-tag-picker"
import { EmailPreview } from "./email-preview"
import { EmailCreationModeSelector } from "./email-creation-mode-selector"
import { EmailTemplatesGallery } from "./email-templates-gallery"
import { AIEmailGenerator } from "./ai-email-generator"
import { toast } from "sonner"
import { ArrowLeft, Save, Monitor, Smartphone, Eye, Send, FileText, Settings2, Sparkles, Code2 } from "lucide-react"
import Link from "next/link"
import { useWorkspace } from "@/context/workspace-context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailTemplateDefinition } from "@/lib/email-templates"
import { GenerateEmailResult } from "@/actions/generate-email"

interface EmailBuilderProps {
    template?: EmailTemplate
    initialSubject?: string
    initialBody?: string
}

export function EmailBuilder({ template, initialSubject, initialBody }: EmailBuilderProps) {
    const router = useRouter()
    const { activeWorkspace } = useWorkspace()
    const [creationMode, setCreationMode] = useState<'select' | 'templates' | 'ai' | 'manual'>(
        template ? 'manual' : 'select' // If editing existing template, go straight to editor
    )
    const [name, setName] = useState(template?.name || "")
    const [subject, setSubject] = useState(initialSubject || template?.subject || "")
    const [bodyHtml, setBodyHtml] = useState(initialBody || template?.body_html || "")
    const [category, setCategory] = useState(template?.category || "general")
    const [saving, setSaving] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

    const handleSave = async () => {
        if (!activeWorkspace) {
            toast.error("Selecione um workspace")
            return
        }

        if (!name || !subject || !bodyHtml) {
            toast.error("Preencha todos os campos obrigatórios")
            return
        }

        setSaving(true)
        try {
            if (template) {
                await updateEmailTemplate(template.id, {
                    name,
                    subject,
                    body_html: bodyHtml,
                    category,
                })
                toast.success("Template atualizado com sucesso!")
            } else {
                const newTemplate = await createEmailTemplate(activeWorkspace.id, {
                    name,
                    subject,
                    body_html: bodyHtml,
                    category,
                })
                toast.success("Template criado com sucesso!")
                router.push(`/dashboard/emails/${newTemplate.id}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar template")
        } finally {
            setSaving(false)
        }
    }

    const handleSelectTemplate = (template: EmailTemplateDefinition) => {
        setName(template.name)
        setSubject(template.subject)
        setBodyHtml(template.body)
        setCategory(template.category)
        setCreationMode('manual')
        toast.success("Template carregado!")
    }

    const handleUseAIResult = (result: GenerateEmailResult) => {
        setName(result.subject) // Use subject as name initially
        setSubject(result.subject)
        setBodyHtml(result.body)
        setCreationMode('manual')
        toast.success("Email gerado com sucesso!")
    }

    const insertMergeTag = (tag: string, field: "subject" | "body") => {
        if (field === "subject") {
            const input = document.getElementById("subject-input") as HTMLInputElement
            if (input) {
                const start = input.selectionStart || 0
                const end = input.selectionEnd || 0
                const newValue = subject.slice(0, start) + tag + subject.slice(end)
                setSubject(newValue)
                // Usando setTimeout para garantir que o focus ocorra após a renderização
                setTimeout(() => {
                    input.focus()
                    input.setSelectionRange(start + tag.length, start + tag.length)
                }, 0)
            }
        } else {
            const textarea = document.getElementById("body-textarea") as HTMLTextAreaElement
            if (textarea) {
                const start = textarea.selectionStart || 0
                const end = textarea.selectionEnd || 0
                const newValue = bodyHtml.slice(0, start) + tag + bodyHtml.slice(end)
                setBodyHtml(newValue)
                setTimeout(() => {
                    textarea.focus()
                    textarea.setSelectionRange(start + tag.length, start + tag.length)
                }, 0)
            }
        }
    }

    // Show mode selector if in 'select' mode
    if (creationMode === 'select') {
        return <EmailCreationModeSelector onSelectMode={setCreationMode} />
    }

    // Show templates gallery if in 'templates' mode
    if (creationMode === 'templates') {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => setCreationMode('select')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <EmailTemplatesGallery onSelectTemplate={handleSelectTemplate} />
                </div>
            </div>
        )
    }

    // Show AI generator if in 'ai' mode
    if (creationMode === 'ai') {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => setCreationMode('select')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <AIEmailGenerator onUseGenerated={handleUseAIResult} />
                </div>
            </div>
        )
    }

    // Show manual editor (default)
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            {/* Toolbar - Estilo Editor */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">Editor de Email</h2>
                        <p className="text-xs text-slate-500">{template ? "Editando template existente" : "Novo template"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                    >
                        {saving ? (
                            <>Salvando...</>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Template
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Editor Inputs */}
                <div className="w-[55%] flex flex-col border-r border-slate-200 bg-white overflow-hidden">
                    <Tabs defaultValue="content" className="flex-1 flex flex-col">
                        <div className="px-6 pt-4 border-b border-slate-100">
                            <TabsList className="bg-slate-100/50">
                                <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Code2 className="w-4 h-4 mr-2" />
                                    Conteúdo
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Settings2 className="w-4 h-4 mr-2" />
                                    Configurações
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Conteúdo Tab */}
                        <TabsContent value="content" className="flex-1 overflow-y-auto p-6 space-y-6 m-0 focus-visible:ring-0">
                            {/* Assunto */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="subject-input" className="text-sm font-medium text-slate-700">
                                        Assunto do Email
                                    </Label>
                                    <MergeTagPicker onSelect={(tag) => insertMergeTag(tag, "subject")} />
                                </div>
                                <Input
                                    id="subject-input"
                                    placeholder="Ex: Oferta especial para {{lead.name}}"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-11 border-slate-200 focus-visible:ring-indigo-500/20 text-base"
                                />
                            </div>

                            {/* Editor HTML */}
                            <div className="space-y-3 flex-1 flex flex-col min-h-[400px]">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="body-textarea" className="text-sm font-medium text-slate-700">
                                        Corpo do Email (HTML)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-normal text-slate-500 bg-slate-50">
                                            Suporta HTML & Tailwind
                                        </Badge>
                                        <MergeTagPicker onSelect={(tag) => insertMergeTag(tag, "body")} />
                                    </div>
                                </div>
                                <div className="relative flex-1">
                                    <Textarea
                                        id="body-textarea"
                                        placeholder="<h1>Olá mundo!</h1>..."
                                        value={bodyHtml}
                                        onChange={(e) => setBodyHtml(e.target.value)}
                                        className="absolute inset-0 w-full h-full font-mono text-sm leading-relaxed border-slate-200 focus-visible:ring-indigo-500/20 resize-none p-4"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Configurações Tab */}
                        <TabsContent value="settings" className="flex-1 p-6 space-y-6 m-0">
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Template (Interno)</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Newsletter Semanal"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-10"
                                    />
                                    <p className="text-xs text-slate-500">Este nome é usado apenas para organização no dashboard.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-10 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">Geral</SelectItem>
                                            <SelectItem value="welcome">Boas-vindas</SelectItem>
                                            <SelectItem value="follow-up">Follow-up</SelectItem>
                                            <SelectItem value="notification">Notificação</SelectItem>
                                            <SelectItem value="promo">Promoção</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Panel - Preview */}
                <div className="flex-1 bg-slate-50/50 flex flex-col overflow-hidden relative border-l border-slate-200">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                    <div className="h-12 border-b border-slate-200/60 bg-white/50 backdrop-blur px-4 flex items-center justify-between z-10">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Eye className="w-3 h-3" /> Preview
                        </span>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setPreviewDevice("desktop")}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    previewDevice === "desktop" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                                )}
                                title="Desktop"
                            >
                                <Monitor className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPreviewDevice("mobile")}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    previewDevice === "mobile" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                                )}
                                title="Mobile"
                            >
                                <Smartphone className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "bg-white shadow-xl shadow-slate-200/50 rounded-lg overflow-hidden border border-slate-200 transition-all duration-300 flex flex-col",
                                previewDevice === "mobile" ? "w-[375px] min-h-[667px]" : "w-full max-w-[800px] min-h-[600px]"
                            )}
                        >
                            {/* Browser Bar */}
                            <div className="h-9 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                </div>
                                <div className="flex-1 mx-4 h-5 bg-white border border-slate-100 rounded text-[10px] flex items-center px-2 text-slate-400">
                                    Visualização do destinatário
                                </div>
                            </div>

                            <div className="flex-1 bg-white">
                                <EmailPreview subject={subject} bodyHtml={bodyHtml} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper component for Badge if not already imported
function Badge({ variant, className, children }: any) {
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === 'outline' ? "text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            className
        )}>
            {children}
        </span>
    )
}
