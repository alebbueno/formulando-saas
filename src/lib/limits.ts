import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/config/plans"

export type LimitResource = "workspaces" | "leads" | "emails"

export async function checkLimit(workspaceId: string, resource: LimitResource) {
    const supabase = await createClient()

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
                slug
            )
        `)
        .eq("id", workspaceId)
        .single()

    if (!workspace || !workspace.plan) {
        // Fallback or Error. If no plan, assume FREE (hardcoded fallback if DB fails)
        // Or better, fetch Free plan from DB if not found.
        // For now, let's assume default restricted
        return { allowed: false, error: "Plano não encontrado" }
    }

    const planData = workspace.plan
    const limits = Array.isArray(planData) ? planData[0] : planData

    if (!limits) {
        return { allowed: false, error: "Plano não encontrado" }
    }

    // 2. Check Usage
    if (resource === "leads") {
        // Count leads in current month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count, error } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("project_id", workspaceId) // WAIT: Leads are linked to Projects, not Workspaces directly?
        // checking lead schema: table leads -> project_id -> projects -> workspace_id
        // We need to join projects.

        // Actually, leads table has project_id. We need to filter by projects belonging to this workspace.
        const { count: usage } = await supabase
            .from("leads")
            .select("id, projects!inner(workspace_id)", { count: "exact", head: true })
            .eq("projects.workspace_id", workspaceId)
            .gte("created_at", startOfMonth.toISOString())

        if (usage && usage >= limits.max_leads_per_month) {
            return { allowed: false, error: `Limite de leads atingido (${usage}/${limits.max_leads_per_month}). Faça upgrade.` }
        }
    }

    // Resource: workspaces (Limit is usually checked BEFORE creating a new one)
    // This is tricky because 'workspaceId' passes the CURRENT workspace, but we need to check OWNER'S total workspaces.

    return { allowed: true }
}

export async function checkOwnerWorkspaceLimit(userId: string) {
    const supabase = await createClient()

    // Check how many workspaces user owns
    const { count } = await supabase
        .from("workspaces")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)

    // Get User's Plan (This is tricky if plan is per-workspace. 
    // Usually "Agency" plans apply to the USER account, or the "Main" workspace.)
    // For this app, it seems 'plans' are linked to workspaces.
    // If "Agency Pro" allows "Unlimited Workspaces", does that mean ONE workspace has "Unlimited" property, 
    // or the USER has right to create more?

    // ASSUMPTION: The User has a "Primary" Subscription/Plan that determines their creation limits.
    // OR, we just check if *ANY* of their workspaces has a high-tier plan? 
    // Let's assume for now we check the plan of the "First" workspace or valid subscription.

    // Simplified logic: Check if user owns ANY workspace with 'agency-pro' or 'scale'.

    return { count }
}
