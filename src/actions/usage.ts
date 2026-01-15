"use server"

import { createClient } from "@/lib/supabase/server"

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
                    max_workspaces
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
        max_workspaces: 1
    }

    // 2. Calculate Leads Usage (Current Month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // We need to count leads in projects belonging to this workspace
    // Correct way: Join projects and filter by workspace_id
    const { count: leadsUsage, error } = await supabase
        .from("leads")
        .select("id, projects!inner(workspace_id)", { count: "exact", head: true })
        .eq("projects.workspace_id", workspaceId)
        .gte("created_at", startOfMonth)

    if (error) {
        console.error("Error fetching usage:", error)
        return null
    }

    return {
        role: member.role,
        plan,
        usage: {
            leads: leadsUsage || 0,
            leadsLimit: plan.max_leads_per_month
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
            plan:plans (
                name,
                slug,
                max_leads_per_month,
                max_workspaces
            )
        `)
        .eq("owner_id", user.id)
        .order('created_at', { ascending: false })

    if (error || !workspaces) return []

    // 2. Calculate Usage for EACH workspace (Parallel)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const workspacesWithUsage = await Promise.all(workspaces.map(async (ws) => {
        const { count } = await supabase
            .from("leads")
            //.select("id, projects!inner(workspace_id)", { count: "exact", head: true }) // optimized count
            // Standard way with filters might be tricky with join syntax in strict mode, let's try direct
            .select("id, projects!inner(workspace_id)", { count: "exact", head: true })
            .eq("projects.workspace_id", ws.id)
            .gte("created_at", startOfMonth)

        const planData = Array.isArray(ws.plan) ? ws.plan[0] : ws.plan
        const plan = planData || { name: 'Gratuito', slug: 'free', max_leads_per_month: 100 }

        return {
            ...ws,
            plan,
            usage: {
                leads: count || 0,
                limit: plan.max_leads_per_month
            }
        }
    }))

    return workspacesWithUsage
}
