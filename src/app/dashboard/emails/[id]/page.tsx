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
        <div className="flex-1 h-screen flex flex-col">
            <EmailBuilder template={template} />
        </div>
    )
}
