"use client"

import { EmailBuilder } from "@/components/emails/email-builder"

export default function NewEmailTemplatePage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-muted/10 overflow-hidden">
            <EmailBuilder />
        </div>
    )
}
