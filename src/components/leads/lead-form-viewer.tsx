"use client"

import { LeadEvent } from "@/actions/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

interface LeadFormViewerProps {
    events: LeadEvent[]
}

export function LeadFormViewer({ events }: LeadFormViewerProps) {
    // Find the first form submission event (most recent)
    // Assuming we want to show the initial submission data prominently
    // Or maybe the latest if there are multiple? Usually one per lead creation.
    // Let's grab the latest 'form_submit' event.
    const submissionEvent = events.find(e => e.type === 'form_submit')

    if (!submissionEvent || !submissionEvent.payload.data) {
        return null
    }

    const data = submissionEvent.payload.data

    return (
        <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    Respostas do Formulário
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(data).map(([key, value]) => {
                        // Skip huge fields or system fields if needed
                        if (typeof value === 'object') return null

                        return (
                            <div key={key} className="group">
                                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1 group-hover:text-primary transition-colors">
                                    {key.replace(/_/g, ' ')}
                                </dt>
                                <dd className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/20 border border-transparent group-hover:border-border transition-colors break-words">
                                    {String(value)}
                                </dd>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
