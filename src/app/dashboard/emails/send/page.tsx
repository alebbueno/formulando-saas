import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { getEmailTemplates, getTargetBases } from "@/actions/emails"
import { getDomains } from "@/actions/domain-actions"
import { getLeads } from "@/actions/leads"
// Using relative import as fallback if @ alias acts up in IDE
import { EmailCampaignForm } from "../../../../components/emails/email-campaign-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function SendEmailPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace) {
        return <div>Selecione um workspace</div>
    }

    // Fetch all necessary data for the form
    const [templates, domainsRes, bases, leadsRes] = await Promise.all([
        getEmailTemplates(activeWorkspace.id),
        getDomains(activeWorkspace.id),
        getTargetBases(activeWorkspace.id),
        getLeads({ workspaceId: activeWorkspace.id, pageSize: 1000 })
    ])

    const verifiedDomains = (domainsRes && domainsRes.success && domainsRes.data) 
        ? domainsRes.data.filter((d: any) => d.status === 'verified') 
        : []
    const leads = leadsRes?.leads || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/emails">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Disparar E-mail</h2>
                    <p className="text-muted-foreground">
                        Envie campanhas manuais para seus leads ou grupos
                    </p>
                </div>
            </div>

            <div className="max-w-4xl">
                <EmailCampaignForm 
                    workspaceId={activeWorkspace.id}
                    templates={templates}
                    domains={verifiedDomains}
                    bases={bases}
                    leads={leads}
                />
            </div>
        </div>
    )
}
