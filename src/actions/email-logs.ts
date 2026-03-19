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
