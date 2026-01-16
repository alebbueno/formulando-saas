"use client"

import { EMAIL_TEMPLATES, EmailTemplateDefinition } from "@/lib/email-templates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmailPreview } from "./email-preview"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eye, Check, Tag } from "lucide-react"

interface EmailTemplatesGalleryProps {
    onSelectTemplate: (template: EmailTemplateDefinition) => void
}

export function EmailTemplatesGallery({ onSelectTemplate }: EmailTemplatesGalleryProps) {
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateDefinition | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { id: 'all', label: 'Todos', count: EMAIL_TEMPLATES.length },
        { id: 'welcome', label: 'Boas-vindas', count: EMAIL_TEMPLATES.filter(t => t.category === 'welcome').length },
        { id: 'follow-up', label: 'Follow-up', count: EMAIL_TEMPLATES.filter(t => t.category === 'follow-up').length },
        { id: 'promo', label: 'Promoções', count: EMAIL_TEMPLATES.filter(t => t.category === 'promo').length },
        { id: 'general', label: 'Geral', count: EMAIL_TEMPLATES.filter(t => t.category === 'general').length },
    ]

    const filteredTemplates = selectedCategory === 'all'
        ? EMAIL_TEMPLATES
        : EMAIL_TEMPLATES.filter(t => t.category === selectedCategory)

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Templates Prontos</h3>
                    <p className="text-muted-foreground mt-1">
                        Escolha um ponto de partida profissional para o seu email
                    </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex bg-muted/50 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap z-10",
                                    isSelected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 bg-primary rounded-full z-[-1]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="flex items-center gap-2">
                                    {cat.label}
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                                        isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                                    )}>
                                        {cat.count}
                                    </span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Templates Grid with Animation */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card
                                className="h-full border-transparent bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 group relative overflow-hidden"
                            >
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <CardHeader className="relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                {template.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                    {template.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 leading-relaxed">
                                                    {template.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 relative">
                                    <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground border border-dashed border-muted-foreground/20 min-h-[60px] line-clamp-3">
                                        {template.preview}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {template.tags.slice(0, 3).map((tag) => (
                                            <div key={tag} className="inline-flex items-center text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                <Tag className="w-3 h-3 mr-1 opacity-50" />
                                                {tag}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            className="flex-1 group/btn"
                                            onClick={() => onSelectTemplate(template)}
                                        >
                                            <Check className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                                            Usar Template
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => setPreviewTemplate(template)}
                                            title="Visualizar"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                    <div className="p-6 border-b bg-muted/10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <span className="text-4xl bg-background p-2 rounded-xl shadow-sm border">
                                    {previewTemplate?.icon}
                                </span>
                                <div className="space-y-1">
                                    <div className="text-xl">{previewTemplate?.name}</div>
                                    <DialogDescription className="text-base">{previewTemplate?.description}</DialogDescription>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                        {previewTemplate && (
                            <div className="max-w-2xl mx-auto shadow-lg rounded-lg overflow-hidden border bg-background">
                                <EmailPreview
                                    subject={previewTemplate.subject}
                                    bodyHtml={previewTemplate.body}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t bg-background flex justify-end gap-3 rounded-b-lg">
                        <Button
                            variant="outline"
                            onClick={() => setPreviewTemplate(null)}
                        >
                            Fechar
                        </Button>
                        <Button
                            className="min-w-[150px]"
                            onClick={() => {
                                if (previewTemplate) onSelectTemplate(previewTemplate)
                                setPreviewTemplate(null)
                            }}
                        >
                            Usar Este Template
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
