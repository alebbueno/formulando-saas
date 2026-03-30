"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendAutomationEmail } from "./send-automation-email"

/**
 * Get email logs for a workspace
 */
export async function getEmailLogs(workspaceId: string, page = 1, pageSize = 20) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
        .from("email_logs")
        .select(`
            *,
            email_template:template_id (name),
            lead:lead_id (name, email)
        `, { count: "exact" })
        .eq("workspace_id", workspaceId)
        .order("sent_at", { ascending: false })
        .range(from, to)

    if (error) {
        console.error("Error fetching email logs:", error)
        return { success: false, error: "Erro ao buscar histórico de e-mails" }
    }

    return {
        success: true,
        logs: data,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
    }
}

/**
 * Resend an email from a log entry
 */
export async function resendEmail(logId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    // 1. Fetch the log entry
    const { data: log, error: logError } = await supabase
        .from("email_logs")
        .select("*, lead:lead_id (*)")
        .eq("id", logId)
        .single()

    if (logError || !log) {
        return { success: false, error: "Log não encontrado" }
    }

    // 2. Resend using sendAutomationEmail
    // Note: this will create a NEW log entry automatically because sendAutomationEmail logs its attempts.
    // We could pass customPrefix if we had stored it in the log, but for now we use default.
    const result = await sendAutomationEmail(
        log.template_id,
        log.lead,
        log.workspace_id
    )

    revalidatePath("/dashboard/emails/history")
    
    return result
}

/**
 * Get metrics for the scheduler dashboard
 */
export async function getSchedulerMetrics(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const [
        { count: scheduledCount },
        { count: pendingCount },
        { count: sent24h },
        { count: failed24h }
    ] = await Promise.all([
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "scheduled"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "pending"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "sent").gte("sent_at", last24h),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "failed").gte("sent_at", last24h)
    ])

    return {
        scheduled: scheduledCount || 0,
        pending: pendingCount || 0,
        sent24h: sent24h || 0,
        failed24h: failed24h || 0
    }
}

/**
 * Get the upcoming scheduled queue
 */
export async function getScheduledQueue(workspaceId: string, limit = 50) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data, error } = await supabase
        .from("email_logs")
        .select(`
            *,
            email_template:template_id (name),
            lead:lead_id (name, email)
        `)
        .eq("workspace_id", workspaceId)
        .in("status", ["scheduled", "pending"])
        .order("scheduled_for", { ascending: true })
        .limit(limit)

    if (error) {
        console.error("Error fetching scheduled queue:", error)
        return []
    }

    return data
}

/**
 * Delete a scheduled log entry (cancel schedule)
 */
export async function deleteScheduledLog(logId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { error } = await supabase
        .from("email_logs")
        .delete()
        .eq("id", logId)
        .in("status", ["scheduled", "pending"])

    if (error) {
        console.error("Error deleting scheduled log:", error)
        return { success: false, error: "Erro ao cancelar agendamento" }
    }

    revalidatePath("/dashboard/emails/scheduler")
    return { success: true }
}

/**
 * Process a scheduled email immediately
 */
export async function processScheduledLogNow(logId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    // Fetch the log with lead data
    const { data: log, error: fetchError } = await supabase
        .from("email_logs")
        .select("*, lead:lead_id (*)")
        .eq("id", logId)
        .single()

    if (fetchError || !log) {
        return { success: false, error: "Log não encontrado" }
    }

    // Call sendAutomationEmail with existingLogId to update the log
    const result = await sendAutomationEmail(
        log.template_id,
        log.lead,
        log.workspace_id,
        undefined,
        { existingLogId: log.id }
    )

    revalidatePath("/dashboard/emails/scheduler")
    revalidatePath("/dashboard/emails/history")
    
    return result
}

/**
 * Get all scheduled email IDs for a workspace (for batch processing)
 */
export async function getScheduledQueueIds(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data, error } = await supabase
        .from("email_logs")
        .select("id")
        .eq("workspace_id", workspaceId)
        .in("status", ["scheduled", "pending"])
        .order("scheduled_for", { ascending: true })

    if (error) {
        console.error("Error fetching scheduled queue IDs:", error)
        return []
    }

    return data.map((item: any) => item.id)
}

/**
 * Get metrics for a specific template/automation
 */
export async function getTemplateStats(templateId: string, workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const [
        { count: scheduledCount },
        { count: pendingCount },
        { count: sentCount },
        { count: failedCount }
    ] = await Promise.all([
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("template_id", templateId).eq("workspace_id", workspaceId).eq("status", "scheduled"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("template_id", templateId).eq("workspace_id", workspaceId).eq("status", "pending"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("template_id", templateId).eq("workspace_id", workspaceId).eq("status", "sent"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("template_id", templateId).eq("workspace_id", workspaceId).eq("status", "failed")
    ])

    return {
        scheduled: scheduledCount || 0,
        pending: pendingCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
        total: (scheduledCount || 0) + (pendingCount || 0) + (sentCount || 0) + (failedCount || 0)
    }
}

/**
 * Get all logs for a specific template
 */
export async function getTemplateLogs(templateId: string, workspaceId: string, status?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    let query = supabase
        .from("email_logs")
        .select(`
            *,
            email_template:template_id (name),
            lead:lead_id (name, email)
        `)
        .eq("template_id", templateId)
        .eq("workspace_id", workspaceId)

    if (status && status !== "all") {
        query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(200)

    if (error) {
        console.error("Error fetching template logs:", error)
        return []
    }

    return data
}

/**
 * Get IDs for a specific template (for batch processing)
 */
export async function getScheduledIdsByTemplate(templateId: string, workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data, error } = await supabase
        .from("email_logs")
        .select("id")
        .eq("template_id", templateId)
        .eq("workspace_id", workspaceId)
        .in("status", ["scheduled", "pending"])
        .order("scheduled_for", { ascending: true })

    if (error) return []
    return data.map((item: any) => item.id)
}
