"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Check if workspace has reached email limit for the month
 */
export async function checkEmailLimit(workspaceId: string): Promise<{
    canSend: boolean
    used: number
    limit: number
    error?: string
}> {
    const supabase = await createClient()

    const { data: workspace, error } = await supabase
        .from("workspaces")
        .select(`
            emails_sent_this_month,
            email_usage_reset_at,
            plan:plans(max_emails_per_month)
        `)
        .eq("id", workspaceId)
        .single()

    if (error || !workspace) {
        return {
            canSend: false,
            used: 0,
            limit: 0,
            error: "Workspace não encontrado"
        }
    }

    const limit = (workspace.plan as any)?.max_emails_per_month || 0
    const used = workspace.emails_sent_this_month || 0

    // Check if we need to reset the counter (monthly)
    const resetDate = new Date(workspace.email_usage_reset_at)
    const now = new Date()
    const daysSinceReset = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceReset >= 30) {
        // Reset counter
        await supabase
            .from("workspaces")
            .update({
                emails_sent_this_month: 0,
                email_usage_reset_at: now.toISOString()
            })
            .eq("id", workspaceId)

        return {
            canSend: true,
            used: 0,
            limit
        }
    }

    return {
        canSend: used < limit,
        used,
        limit
    }
}

/**
 * Increment email counter for workspace
 */
export async function incrementEmailUsage(workspaceId: string): Promise<void> {
    const supabase = await createClient()

    await supabase.rpc('increment_email_usage', {
        workspace_id_param: workspaceId
    })
}
