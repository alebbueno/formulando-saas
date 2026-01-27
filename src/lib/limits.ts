import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/config/plans"
import { SupabaseClient } from "@supabase/supabase-js"

export type LimitResource =
    | "workspaces"
    | "leads"
    | "emails"
    | "forms"
    | "landing_pages"
    | "automations"
    | "email_templates"
    | "whatsapp"
    | "integrations"
    | "branding"

export async function checkLimit(workspaceId: string, resource: LimitResource, client?: SupabaseClient) {
    const supabase = client || await createClient()

    // 1. Get Workspace Plan
    const { data: workspace } = await supabase
        .from("workspaces")
        .select(`
            id, 
            plan_id,
            plan:plans (
                max_workspaces,
                max_leads_per_month,
                max_emails_per_month,
                max_projects,
                max_landing_pages,
                max_automations,
                max_email_templates,
                can_use_whatsapp,
                can_use_integrations,
                can_remove_branding,
                slug
            )
        `)
        .eq("id", workspaceId)
        .single()

    if (!workspace || !workspace.plan) {
        return { allowed: false, error: "Plano não encontrado" }
    }

    const planData = workspace.plan as any
    const limits = Array.isArray(planData) ? planData[0] : planData

    if (!limits) {
        return { allowed: false, error: "Plano não encontrado" }
    }

    // 2. Check Usage
    if (resource === "leads") {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: usage } = await supabase
            .from("leads")
            .select("id, projects!inner(workspace_id)", { count: "exact", head: true })
            .eq("projects.workspace_id", workspaceId)
            .gte("created_at", startOfMonth.toISOString())

        if (usage !== null && limits.max_leads_per_month !== -1 && usage >= limits.max_leads_per_month) {
            return { allowed: false, error: `Limite de leads atingido (${usage}/${limits.max_leads_per_month}). Faça upgrade.` }
        }
    }

    if (resource === "forms") {
        const { count: usage } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)

        if (usage !== null && limits.max_projects !== -1 && usage >= limits.max_projects) {
            return { allowed: false, error: `Limite de formulários atingido (${usage}/${limits.max_projects}). Faça upgrade.` }
        }
    }

    if (resource === "landing_pages") {
        const { count: usage } = await supabase
            .from("landing_pages")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)

        if (usage !== null && limits.max_landing_pages !== -1 && usage >= limits.max_landing_pages) {
            return { allowed: false, error: `Limite de Landing Pages atingido (${usage}/${limits.max_landing_pages}). Faça upgrade.` }
        }
    }

    if (resource === "automations") {
        const { count: usage } = await supabase
            .from("automations")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)

        if (usage !== null && limits.max_automations !== -1 && usage >= limits.max_automations) {
            return { allowed: false, error: `Limite de automações atingido (${usage}/${limits.max_automations}). Faça upgrade.` }
        }
    }

    if (resource === "email_templates") {
        const { count: usage } = await supabase
            .from("email_templates")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)

        if (usage !== null && limits.max_email_templates !== -1 && usage >= limits.max_email_templates) {
            return { allowed: false, error: `Limite de modelos de email atingido (${usage}/${limits.max_email_templates}). Faça upgrade.` }
        }
    }

    if (resource === "emails") {
        // TODO: Check email monthly usage
        // This typically requires tracking sent emails in a separate table/log within the month.
    }

    if (resource === "whatsapp") {
        if (!limits.can_use_whatsapp) {
            return { allowed: false, error: "Integração com WhatsApp não disponível no seu plano." }
        }
    }

    if (resource === "integrations") {
        if (!limits.can_use_integrations) {
            return { allowed: false, error: "Integrações não disponíveis no seu plano." }
        }
    }

    if (resource === "branding") {
        if (!limits.can_remove_branding) {
            return { allowed: false, error: "Remoção de branding não disponível no seu plano." }
        }
    }

    return { allowed: true }
}

export async function checkOwnerWorkspaceLimit(userId: string) {
    const supabase = await createClient()

    // Check how many workspaces user owns
    const { count } = await supabase
        .from("workspaces")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)

    return { count }
}
