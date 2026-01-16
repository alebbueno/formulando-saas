"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { processMergeTags, getSampleContext } from "@/lib/email-merge-tags"
import { Mail } from "lucide-react"

interface EmailPreviewProps {
    subject: string
    bodyHtml: string
}

export function EmailPreview({ subject, bodyHtml }: EmailPreviewProps) {
    const sampleContext = getSampleContext()

    const processedSubject = processMergeTags(subject, sampleContext)
    const processedBody = processMergeTags(bodyHtml, sampleContext)

    // Determine if content is full HTML or plain text
    const isHtml = /<!DOCTYPE html>|<html/i.test(processedBody)

    // Prepare content for iframe
    const iframeContent = isHtml
        ? processedBody
        : `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: -apple-system, sans-serif; color: #333; line-height: 1.6; padding: 20px; }
                        p { margin-bottom: 1em; }
                    </style>
                </head>
                <body>
                    ${processedBody.split('\n').map(line => line || '<br>').join('')}
                </body>
            </html>
        `

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 shrink-0">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Preview do Email</h3>
                <Badge variant="secondary" className="ml-auto">Dados de Exemplo</Badge>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-2 border-dashed">
                <CardHeader className="bg-muted/50 border-b py-3 shrink-0">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-12 shrink-0">Para:</span>
                            <span className="truncate">{sampleContext.lead?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-12 shrink-0">De:</span>
                            <span className="truncate">{sampleContext.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-12 shrink-0">Assunto:</span>
                            <span className="font-medium truncate">
                                {processedSubject || <span className="text-muted-foreground italic">Sem assunto</span>}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 bg-white relative">
                    {bodyHtml ? (
                        <iframe
                            srcDoc={iframeContent}
                            className="w-full h-full absolute inset-0 border-none"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground italic">
                            Digite o corpo do email para ver o preview...
                        </div>
                    )}
                </div>
            </Card>

            <Card className="bg-muted/20 shrink-0">
                <CardHeader className="py-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Merge Tags Detectadas</h4>
                </CardHeader>
                <CardContent className="py-3">
                    <div className="flex flex-wrap gap-2">
                        {extractMergeTags(subject + bodyHtml).map((tag, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-[10px] bg-background">
                                {tag}
                            </Badge>
                        ))}
                        {extractMergeTags(subject + bodyHtml).length === 0 && (
                            <span className="text-xs text-muted-foreground">Nenhuma tag usada</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function extractMergeTags(text: string): string[] {
    const regex = /\{\{[^}]+\}\}/g
    const matches = text.match(regex)
    return matches ? Array.from(new Set(matches)) : []
}
