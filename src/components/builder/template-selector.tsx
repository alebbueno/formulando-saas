"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { getTemplates } from "@/actions/form"
import { FormElementInstance } from "@/context/builder-context"
import { FormElements } from "@/components/builder/form-elements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Template {
    id: string
    name: string
    description: string
    category: string
    content: FormElementInstance[]
    is_active: boolean
}

interface TemplateSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onInsert: (elements: FormElementInstance[]) => void
}

export function TemplateSelector({ open, onOpenChange, onInsert }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            loadTemplates()
        }
    }, [open])

    const loadTemplates = async () => {
        setLoading(true)
        try {
            const data = await getTemplates()
            // Parse content if it's a string
            const parsedTemplates = data.map((template: any) => ({
                ...template,
                content: typeof template.content === 'string' 
                    ? JSON.parse(template.content) 
                    : template.content
            }))
            setTemplates(parsedTemplates as Template[])
        } catch (error) {
            console.error("Error loading templates:", error)
            toast.error("Erro ao carregar templates")
        } finally {
            setLoading(false)
        }
    }

    const handleInsert = () => {
        if (!selectedTemplate) return

        // Generate new IDs for all elements to avoid conflicts
        const newElements = selectedTemplate.content.map((element) => ({
            ...element,
            id: crypto.randomUUID(),
        }))

        onInsert(newElements)
        toast.success("Template inserido com sucesso!")
        onOpenChange(false)
        setSelectedTemplate(null)
    }

    const categories = Array.from(new Set(templates.map((t) => t.category)))

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-5xl p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4">
                    <SheetTitle>Escolher Template</SheetTitle>
                    <SheetDescription>
                        Selecione um template para adicionar ao seu formulário
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6 overflow-hidden">
                    {/* Lista de Templates */}
                    <div className="flex flex-col gap-4 min-h-0">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                            Templates Disponíveis
                        </h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="space-y-4 pr-4">
                                    {categories.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>Nenhum template disponível</p>
                                        </div>
                                    ) : (
                                        categories.map((category) => (
                                            <div key={category}>
                                                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                                    {category}
                                                </h4>
                                                <div className="space-y-2">
                                                    {templates
                                                        .filter((t) => t.category === category)
                                                        .map((template) => (
                                                            <Card
                                                                key={template.id}
                                                                className={`cursor-pointer transition-all hover:border-primary ${
                                                                    selectedTemplate?.id === template.id
                                                                        ? "border-primary bg-primary/5"
                                                                        : ""
                                                                }`}
                                                                onClick={() => setSelectedTemplate(template)}
                                                            >
                                                                <CardHeader className="pb-3">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <CardTitle className="text-base">
                                                                            {template.name}
                                                                        </CardTitle>
                                                                        <Badge variant="secondary" className="text-xs shrink-0">
                                                                            {template.content.length} campos
                                                                        </Badge>
                                                                    </div>
                                                                    <CardDescription className="text-sm">
                                                                        {template.description}
                                                                    </CardDescription>
                                                                </CardHeader>
                                                            </Card>
                                                        ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col gap-4 min-h-0">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                            Preview
                        </h3>
                        <ScrollArea className="flex-1 border rounded-lg bg-muted/20">
                            <div className="p-4">
                                {selectedTemplate ? (
                                    <div className="space-y-4">
                                        {selectedTemplate.content.map((element) => {
                                            const FormElement = FormElements[element.type]
                                            if (!FormElement) return null

                                            return (
                                                <div key={element.id}>
                                                    {FormElement.designerComponent({
                                                        elementInstance: element,
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
                                        <p className="text-center">Selecione um template para ver o preview</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        {selectedTemplate && (
                            <Button
                                onClick={handleInsert}
                                className="w-full"
                                size="lg"
                            >
                                Inserir Template
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
