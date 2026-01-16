import { getEmailTemplates } from "@/actions/emails"
import { EmailTemplatesTable } from "@/components/emails/email-templates-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function EmailsPage() {
    const { getActiveWorkspace } = await import("@/lib/get-active-workspace")
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    const templates = await getEmailTemplates(activeWorkspace.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Templates de Email</h2>
                    <p className="text-muted-foreground">
                        Crie e gerencie templates de email com personalização
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/emails/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Template
                    </Link>
                </Button>
            </div>

            <EmailTemplatesTable templates={templates} />
        </div>
    )
}
