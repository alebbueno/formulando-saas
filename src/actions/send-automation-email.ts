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

/**
 * Replace merge tags in text with actual lead data
 * Supports: {{lead.field_name}}
 */
function replaceMergeTags(text: string, leadData: LeadData): string {
    return text.replace(/\{\{lead\.(\w+)\}\}/g, (match, field) => {
        const value = leadData[field]
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
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("Usuário não autenticado")
        }

        console.log('[sendAutomationEmail] Starting...', { templateId, leadEmail: leadData.email })

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

        // Replace merge tags in subject and body
        const personalizedSubject = replaceMergeTags(template.subject, leadData)
        const personalizedBody = replaceMergeTags(template.body_html, leadData)

        // Get workspace info for "from" email
        const { data: workspace } = await supabase
            .from("workspaces")
            .select("name")
            .eq("id", workspaceId)
            .single()

        const fromName = workspace?.name || "Formulando"
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

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

    const personalizedSubject = replaceMergeTags(template.subject, sampleLeadData)
    const personalizedBody = replaceMergeTags(template.body_html, sampleLeadData)

    return {
        subject: personalizedSubject,
        body: personalizedBody,
        originalSubject: template.subject,
        originalBody: template.body_html,
    }
}
