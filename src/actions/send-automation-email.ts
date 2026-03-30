"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
    workspaceId: string,
    customPrefix?: string,
    options?: {
        scheduledFor?: Date,
        existingLogId?: string
    }
) {
    try {
        console.log('[sendAutomationEmail] Starting...', { templateId, leadEmail: leadData.email })

        // Check email limit before sending
        const { checkEmailLimit, incrementEmailUsage } = await import('./email-usage')
        const limitCheck = await checkEmailLimit(workspaceId)

        if (!limitCheck.canSend) {
            console.error('[sendAutomationEmail] Email limit reached:', {
                used: limitCheck.used,
                limit: limitCheck.limit
            })
            throw new Error(`Limite de emails atingido (${limitCheck.used}/${limitCheck.limit}). Faça upgrade do seu plano.`)
        }

        console.log('[sendAutomationEmail] Email limit OK:', {
            used: limitCheck.used,
            limit: limitCheck.limit,
            remaining: limitCheck.limit - limitCheck.used
        })

        // Use service role client for automation context (no user auth required)
        const supabase = createAdminClient()

        // Fetch the email template directly with admin client to bypass RLS
        const { data: template, error: templateError } = await supabase
            .from("email_templates")
            .select("*")
            .eq("id", templateId)
            .single()

        if (templateError || !template) {
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
        const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("name, owner_id, sender_email, sender_name")
            .eq("id", workspaceId)
            .single()

        if (workspaceError) {
            console.error('[sendAutomationEmail] Error fetching workspace:', workspaceError)
        }

        console.log('[sendAutomationEmail] Workspace data:', workspace)

        // Get user info for merge tags (workspace owner)
        let userData = null
        if (workspace?.owner_id) {
            const { data } = await supabase
                .from("users")
                .select("name, email")
                .eq("id", workspace.owner_id)
                .single()
            userData = data
        }

        // Prepare merge tag data
        const mergeData: MergeTagData = {
            lead: leadData,
            workspace: workspace || undefined,
            user: userData || undefined
        }

        console.log('[sendAutomationEmail] Merge data prepared:', {
            hasLead: !!mergeData.lead,
            leadName: mergeData.lead?.name,
            hasWorkspace: !!mergeData.workspace,
            workspaceName: mergeData.workspace?.name,
            hasUser: !!mergeData.user,
            userName: mergeData.user?.name,
            userEmail: mergeData.user?.email
        })

        console.log('[sendAutomationEmail] Full merge data:', JSON.stringify(mergeData, null, 2))

        // Replace merge tags in subject and body
        const personalizedSubject = replaceMergeTags(template.subject, mergeData)
        const personalizedBody = replaceMergeTags(template.body_html, mergeData)

        console.log('[sendAutomationEmail] Personalization complete:', {
            originalSubject: template.subject,
            personalizedSubject,
            bodyHasWorkspaceName: personalizedBody.includes(workspace?.name || 'MISSING')
        })

        // Use workspace sender_email as Reply-To if configured
        const replyTo = workspace?.sender_email || undefined

        // CHECK FOR CUSTOM VERIFIED DOMAIN
        const { data: verifiedDomains } = await supabase
            .from("domains")
            .select("domain")
            .eq("workspace_id", workspaceId)
            .eq("status", "verified")
            .order("is_default", { ascending: false }) // Prioritize default
            .limit(1)

        const verifiedDomain = verifiedDomains?.[0]?.domain

        console.log('[sendAutomationEmail] Custom domain check:', { verifiedDomain })

        // Configure sender: use custom domain if available, otherwise fallback to system email
        const fromName = workspace?.sender_name || workspace?.name || "Formulando"
        let fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

        if (verifiedDomain) {
            // Extract prefix from customPrefix, sender_email or use contact
            const prefix = customPrefix || (workspace?.sender_email ? workspace.sender_email.split('@')[0] : "contato")
            fromEmail = `${prefix}@${verifiedDomain}`
            console.log('[sendAutomationEmail] Using custom domain:', fromEmail)
        }

        if (options?.scheduledFor) {
            console.log('[sendAutomationEmail] Scheduling email for:', options.scheduledFor)
            const adminSupabase = createAdminClient()
            const { error: logError } = await adminSupabase.from("email_logs").insert({
                workspace_id: workspaceId,
                template_id: templateId,
                lead_id: leadData.id,
                recipient_email: leadData.email,
                subject: personalizedSubject,
                status: "scheduled",
                scheduled_for: options.scheduledFor.toISOString(),
            })
            if (logError) {
                console.error('[sendAutomationEmail] Failed to schedule email:', logError)
                throw new Error(`Erro ao agendar email: ${logError.message}`)
            }
            return {
                success: true,
                scheduled: true,
            }
        }

        console.log('[sendAutomationEmail] Sending via Resend to:', leadData.email)

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            replyTo: replyTo,
            to: [leadData.email],
            subject: personalizedSubject,
            html: personalizedBody,
        })

        if (error) {
            console.error("Resend error:", error)
            throw new Error(`Erro ao enviar email: ${error.message}`)
        }

        console.log('[sendAutomationEmail] Email sent successfully!', data?.id)

        // Increment email usage counter for workspace
        try {
            await incrementEmailUsage(workspaceId)
            console.log('[sendAutomationEmail] Email usage incremented for workspace')
        } catch (usageError) {
            console.error('[sendAutomationEmail] Failed to increment usage:', usageError)
            // Don't fail the email send if usage tracking fails
        }

        // Log the email sent event using admin client to ensure it persists regardless of auth context
        const adminSupabase = createAdminClient()
        if (options?.existingLogId) {
            const { error: logError } = await adminSupabase.from("email_logs").update({
                resend_id: data?.id,
                status: "sent",
                sent_at: new Date().toISOString(),
            }).eq("id", options.existingLogId)

            if (logError) {
                console.error('[sendAutomationEmail] Failed to update scheduled email log to database:', logError)
            }
        } else {
            const { error: logError } = await adminSupabase.from("email_logs").insert({
                workspace_id: workspaceId,
                template_id: templateId,
                lead_id: leadData.id,
                recipient_email: leadData.email,
                subject: personalizedSubject,
                status: "sent",
                resend_id: data?.id,
                sent_at: new Date().toISOString(),
            })

            if (logError) {
                console.error('[sendAutomationEmail] Failed to log email to database:', logError)
            }
        }

        console.log(`[sendAutomationEmail] Email sent successfully to ${leadData.email}:`, data?.id)

        return {
            success: true,
            messageId: data?.id,
        }
    } catch (error) {
        console.error("Error sending automation email:", error)

        // Log the failed attempt using admin client
        const adminSupabase = createAdminClient()
        
        if (options?.existingLogId) {
             const { error: logError } = await adminSupabase.from("email_logs").update({
                status: "failed",
                error_message: error instanceof Error ? error.message : String(error),
                sent_at: new Date().toISOString(),
            }).eq("id", options.existingLogId)

            if (logError) {
                console.error('[sendAutomationEmail] Failed to log email error to database (update):', logError)
            }
        } else {
            const { error: logError } = await adminSupabase.from("email_logs").insert({
                workspace_id: workspaceId,
                template_id: templateId,
                lead_id: leadData.id,
                recipient_email: leadData.email || "unknown",
                subject: "Failed to send",
                status: "failed",
                error_message: error instanceof Error ? error.message : String(error),
                sent_at: new Date().toISOString(),
            })

            if (logError) {
                console.error('[sendAutomationEmail] Failed to log email error to database:', logError)
            }
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
