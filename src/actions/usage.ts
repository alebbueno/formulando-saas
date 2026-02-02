"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getWorkspaceUsage(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select(`
            role,
            workspace:workspaces (
                id,
                plan_id,
                plan:plans (
                    name,
                    slug,
                    max_leads_per_month,
                    max_emails_per_month,
                    max_workspaces,
                    max_projects,
                    max_landing_pages,
                    max_automations,
                    max_email_templates
                )
            )
        `)
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single()

    if (memberError) {
        console.error("Usage Action Error (Member/Plan Fetch):", memberError)
        return null
    }

    if (!member) {
        return null // Not a member
    }

    const workspaceData = Array.isArray(member.workspace) ? member.workspace[0] : member.workspace
    if (!workspaceData) return null

    const planData = Array.isArray(workspaceData.plan) ? workspaceData.plan[0] : workspaceData.plan
    const plan = planData || {
        name: "Gratuito",
        slug: "free",
        max_leads_per_month: 100,
        max_emails_per_month: 100,
        max_workspaces: 1,
        max_projects: 2,
        max_landing_pages: 1,
        max_automations: 1,
        max_email_templates: 2
    }

    // 2. Fetch Usage Counts
    const now = new Date()
    // Use UTC to ensure we catch all leads from the start of the month 00:00 UTC
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()
    const adminSupabase = createAdminClient()

    // Counts (Parallel)
    const [
        { count: leadsUsage },
        { count: formsUsage },
        { count: lpUsage },
        { count: automationsUsage },
        { count: emailTemplatesUsage },
        { count: emailsSentUsage }
    ] = await Promise.all([
        // Leads this month
        adminSupabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),
        // .gte("created_at", startOfMonth),

        // Forms (projects with type != LP)
        adminSupabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .neq("type", "lp"),

        // Landing Pages (projects with type = LP)
        adminSupabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("type", "lp"),

        // Automations
        adminSupabase
            .from("automations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),

        // Email Templates
        adminSupabase
            .from("email_templates")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),

        // Emails sent this month
        Promise.resolve({ count: 0 })
    ])

    return {
        role: member.role,
        plan,
        usage: {
            leads: leadsUsage || 0,
            leadsLimit: plan.max_leads_per_month,
            forms: formsUsage || 0,
            formsLimit: plan.max_projects,
            landingPages: lpUsage || 0,
            landingPagesLimit: plan.max_landing_pages,
            automations: automationsUsage || 0,
            automationsLimit: plan.max_automations,
            emailTemplates: emailTemplatesUsage || 0,
            emailTemplatesLimit: plan.max_email_templates,
            emailsSent: emailsSentUsage || 0,
            emailsSentLimit: plan.max_emails_per_month
        }
    }
}

export async function getOwnerWorkspacesWithUsage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Get All Owner Workspaces with Plans
    const { data: workspaces, error } = await supabase
        .from("workspaces")
        .select(`
            id,
            name,
            created_at,
            subscription_status,
            emails_sent_this_month,
            plan:plans (
                name,
                slug,
                max_leads_per_month,
                max_emails_per_month,
                max_workspaces
            )
        `)
        .eq("owner_id", user.id)
        .order('created_at', { ascending: false })

    if (error || !workspaces) return []

    // 2. Calculate Usage for EACH workspace (Parallel)
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()
    const adminSupabase = createAdminClient()

    const workspacesWithUsage = await Promise.all(workspaces.map(async (ws) => {
        // Query leads directly by workspace_id to include ALL leads (manual + form submissions)
        const { count, error } = await adminSupabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", ws.id)
        // .gte("created_at", startOfMonth)

        if (error) {
            console.error(`[Usage Debug] Error fetching leads for workspace ${ws.name} (${ws.id}):`, error)
        }

        const planData = Array.isArray(ws.plan) ? ws.plan[0] : ws.plan
        const plan = planData || { name: 'Gratuito', slug: 'free', max_leads_per_month: 100 }

        return {
            ...ws,
            plan,
            usage: {
                leads: count || 0,
                limit: plan.max_leads_per_month,
                emails: ws.emails_sent_this_month || 0,
                emailsLimit: plan.max_emails_per_month || 100 // Default to 100 if undefined
            }
        }
    }))

    return workspacesWithUsage
}
