import { getEmailTemplate } from "@/actions/emails"
import { EmailBuilder } from "@/components/emails/email-builder"
import { notFound } from "next/navigation"

export default async function EditEmailTemplatePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const template = await getEmailTemplate(id)

    if (!template) {
        notFound()
    }

    return (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
            <EmailBuilder template={template} />
        </div>
    )
}
