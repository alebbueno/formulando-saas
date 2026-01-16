"use client"

import { EmailBuilder } from "@/components/emails/email-builder"

export default function NewEmailTemplatePage() {
    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-muted/10">
            <EmailBuilder />
        </div>
    )
}
