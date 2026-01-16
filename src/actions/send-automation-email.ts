"use server"

import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { getEmailTemplate } from "./emails"

const resend = new Resend(process.env.RESEND_API_KEY || process.env.RESEND_API)

interface LeadData {
    id: string
    name?: string
    email?: string
    phone?: string
    [key: string]: any // Allow any additional fields
}

interface MergeTagData {
    lead: LeadData
    workspace?: {
        name?: string
        [key: string]: any
    }
    user?: {
        name?: string
        email?: string
        [key: string]: any
    }
}

/**
 * Replace merge tags in text with actual data
 * Supports: {{lead.field}}, {{workspace.field}}, {{user.field}}
 */
function replaceMergeTags(text: string, data: MergeTagData): string {
    return text
        // Replace {{lead.field}}
        .replace(/\{\{lead\.(\w+)\}\}/g, (match, field) => {
            const value = data.lead?.[field]
            return value !== undefined && value !== null ? String(value) : match
        })
        // Replace {{workspace.field}}
        .replace(/\{\{workspace\.(\w+)\}\}/g, (match, field) => {
            const value = data.workspace?.[field]
            return value !== undefined && value !== null ? String(value) : match
        })
        // Replace {{user.field}}
        .replace(/\{\{user\.(\w+)\}\}/g, (match, field) => {
            const value = data.user?.[field]
            return value !== undefined && value !== null ? String(value) : match
        })
}

/**
 * Send an email using a template with personalized lead data
 */
export async function sendAutomationEmail(
    templateId: string,
    leadData: LeadData,
    workspaceId: string
) {
    try {
        console.log('[sendAutomationEmail] Starting...', { templateId, leadEmail: leadData.email })

        // Use service role client for automation context (no user auth required)
        const supabase = await createClient()

        // Fetch the email template
        const template = await getEmailTemplate(templateId)

        if (!template) {
            throw new Error(`Template de email não encontrado: ${templateId}`)
        }

        console.log('[sendAutomationEmail] Template found:', template.name)

        if (!template.is_active) {
            throw new Error(`Template de email está inativo: ${template.name}`)
        }

        // Validate lead has email
        if (!leadData.email) {
            throw new Error("Lead não possui email")
        }

        // Get workspace info for "from" email and merge tags
        const { data: workspace } = await supabase
            .from("workspaces")
            .select("name, created_by, sender_email, sender_name")
            .eq("id", workspaceId)
            .single()

        // Get user info for merge tags (workspace owner)
        let userData = null
        if (workspace?.created_by) {
            const { data } = await supabase
                .from("users")
                .select("name, email")
                .eq("id", workspace.created_by)
                .single()
            userData = data
        }

        // Prepare merge tag data
        const mergeData: MergeTagData = {
            lead: leadData,
            workspace: workspace || undefined,
            user: userData || undefined
        }

        // Replace merge tags in subject and body
        const personalizedSubject = replaceMergeTags(template.subject, mergeData)
        const personalizedBody = replaceMergeTags(template.body_html, mergeData)

        // Use workspace custom sender email/name if configured, otherwise use defaults
        const fromName = workspace?.sender_name || workspace?.name || "Formulando"
        const fromEmail = workspace?.sender_email || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

        console.log('[sendAutomationEmail] Sending via Resend to:', leadData.email)

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [leadData.email],
            subject: personalizedSubject,
            html: personalizedBody,
        })

        if (error) {
            console.error("Resend error:", error)
            throw new Error(`Erro ao enviar email: ${error.message}`)
        }

        // Log the email sent event (optional - won't fail if table doesn't exist)
        try {
            await supabase.from("email_logs").insert({
                workspace_id: workspaceId,
                template_id: templateId,
                lead_id: leadData.id,
                recipient_email: leadData.email,
                subject: personalizedSubject,
                status: "sent",
                resend_id: data?.id,
                sent_at: new Date().toISOString(),
            })
        } catch (logError) {
            console.warn('[sendAutomationEmail] Failed to log email:', logError)
        }

        console.log(`[sendAutomationEmail] Email sent successfully to ${leadData.email}:`, data?.id)

        return {
            success: true,
            messageId: data?.id,
        }
    } catch (error) {
        console.error("Error sending automation email:", error)

        // Log the failed attempt
        try {
            const supabase = await createClient()
            await supabase.from("email_logs").insert({
                workspace_id: workspaceId,
                template_id: templateId,
                lead_id: leadData.id,
                recipient_email: leadData.email || "unknown",
                subject: "Failed to send",
                status: "failed",
                error_message: error instanceof Error ? error.message : String(error),
                sent_at: new Date().toISOString(),
            })
        } catch (logError) {
            console.error("Failed to log email error:", logError)
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido ao enviar email",
        }
    }
}

/**
 * Test function to preview email with merge tags replaced
 */
export async function previewAutomationEmail(
    templateId: string,
    sampleLeadData: LeadData
) {
    const template = await getEmailTemplate(templateId)

    if (!template) {
        throw new Error("Template não encontrado")
    }

    const mergeData: MergeTagData = {
        lead: sampleLeadData,
        workspace: { name: "Example Workspace" },
        user: { name: "Example User", email: "user@example.com" }
    }

    const personalizedSubject = replaceMergeTags(template.subject, mergeData)
    const personalizedBody = replaceMergeTags(template.body_html, mergeData)

    return {
        subject: personalizedSubject,
        body: personalizedBody,
        originalSubject: template.subject,
        originalBody: template.body_html,
    }
}
