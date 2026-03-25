"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkLimit } from "@/lib/limits"
import { sendAutomationEmail } from "./send-automation-email"

export interface EmailTemplate {
    id: string
    workspace_id: string
    name: string
    subject: string
    body_html: string
    body_text: string | null
    category: string
    is_active: boolean
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface CreateEmailTemplateData {
    name: string
    subject: string
    body_html: string
    body_text?: string
    category?: string
    is_active?: boolean
}

/**
 * Get all email templates for a workspace
 */
export async function getEmailTemplates(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching email templates:", error)
        throw new Error("Erro ao buscar templates de email")
    }

    return data as EmailTemplate[]
}

/**
 * Get a single email template by ID
 */
export async function getEmailTemplate(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching email template:", error)
        return null
    }

    return data as EmailTemplate
}

/**
 * Create a new email template
 */
export async function createEmailTemplate(
    workspaceId: string,
    templateData: CreateEmailTemplateData
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    // CHECK LIMITS
    const limitCheck = await checkLimit(workspaceId, "email_templates")
    if (!limitCheck.allowed) {
        throw new Error(limitCheck.error || "Limite de templates de email atingido.")
    }

    const { data, error } = await supabase
        .from("email_templates")
        .insert({
            workspace_id: workspaceId,
            name: templateData.name,
            subject: templateData.subject,
            body_html: templateData.body_html,
            body_text: templateData.body_text || null,
            category: templateData.category || 'general',
            is_active: templateData.is_active ?? true,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating email template:", error)
        throw new Error("Erro ao criar template de email")
    }

    revalidatePath("/dashboard/emails")
    return data as EmailTemplate
}

/**
 * Update an email template
 */
export async function updateEmailTemplate(
    id: string,
    templateData: Partial<CreateEmailTemplateData>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { data, error } = await supabase
        .from("email_templates")
        .update({
            ...templateData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating email template:", error)
        throw new Error("Erro ao atualizar template de email")
    }

    revalidatePath("/dashboard/emails")
    revalidatePath(`/dashboard/emails/${id}`)
    return data as EmailTemplate
}

/**
 * Delete an email template
 */
export async function deleteEmailTemplate(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting email template:", error)
        throw new Error("Erro ao deletar template de email")
    }

    revalidatePath("/dashboard/emails")
}

/**
 * Toggle email template active status
 */
export async function toggleEmailTemplateStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { error } = await supabase
        .from("email_templates")
        .update({ is_active: isActive })
        .eq("id", id)

    if (error) {
        console.error("Error toggling template status:", error)
        throw new Error("Erro ao atualizar status do template")
    }

    revalidatePath("/dashboard/emails")
}

/**
 * Get available "bases" (tags and statuses) for a workspace
 */
export async function getTargetBases(workspaceId: string) {
    const supabase = await createClient()
    
    // 1. Get unique statuses from kanban columns or leads
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("kanban_columns")
        .eq("id", workspaceId)
        .single()
    
    const statuses = workspace?.kanban_columns?.map((c: any) => c.id) || []
    
    // 2. Get unique tags from leads
    const { data: leadsTags } = await supabase
        .from("leads")
        .select("tags")
        .eq("workspace_id", workspaceId)

    const allTags = new Set<string>()
    leadsTags?.forEach(lead => {
        if (Array.isArray(lead.tags)) {
            lead.tags.forEach(tag => allTags.add(tag))
        }
    })

    return {
        statuses: statuses as string[],
        tags: Array.from(allTags),
    }
}

/**
 * Send a manual email campaign to a base or specific lead
 */
export async function sendManualCampaign(
    workspaceId: string,
    templateId: string,
    target: {
        type: 'all' | 'tag' | 'status' | 'single'
        value?: string // tag name, status name, or lead id
    },
    fromPrefix?: string
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Não autenticado")

        // 1. Fetch template
        const template = await getEmailTemplate(templateId)
        if (!template) throw new Error("Template não encontrado")

        // 2. Identify target leads
        let leadsQuery = supabase
            .from("leads")
            .select("*")
            .eq("workspace_id", workspaceId)

        if (target.type === 'tag') {
            leadsQuery = leadsQuery.contains('tags', [target.value])
        } else if (target.type === 'status') {
            leadsQuery = leadsQuery.eq('status', target.value)
        } else if (target.type === 'single') {
            leadsQuery = leadsQuery.eq('id', target.value)
        }
        
        const { data: leads, error: leadsError } = await leadsQuery

        if (leadsError) throw leadsError
        if (!leads || leads.length === 0) {
            return { success: false, error: "Nenhum lead encontrado para este público." }
        }

        // 3. Send emails
        let sentCount = 0
        let scheduledCount = 0
        let errorCount = 0
        const errors: string[] = []

        // In a real production app, we might want to use a queue or limit concurrency
        // For the Growth plan, we split the load into multiple days (100 per day)
        // If a campaign has 350 leads, Day 0: 100, Day 1: 100, Day 2: 100, Day 3: 50.
        const dailyLimit = 100;
        
        await Promise.all(
            leads.map(async (lead, index) => {
                try {
                    const delayDays = Math.floor(index / dailyLimit);
                    const scheduledFor = delayDays > 0 
                        ? new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000)
                        : undefined;

                    const res = await sendAutomationEmail(templateId, lead, workspaceId, fromPrefix, { scheduledFor })
                    
                    if (res.success) {
                        if ((res as any).scheduled) {
                            scheduledCount++
                        } else {
                            sentCount++
                        }
                    } else {
                        errorCount++
                        errors.push(`Erro para ${lead.email}: ${res.error}`)
                    }
                } catch (e) {
                    errorCount++
                    errors.push(`Erro para ${lead.email}: ${e instanceof Error ? e.message : 'Erro genérico'}`)
                }
            })
        )

        revalidatePath("/dashboard/emails")
        
        return {
            success: true,
            sentCount,
            scheduledCount,
            errorCount,
            errors: errors.slice(0, 10), // Limit error list
            totalAttempted: leads.length
        }

    } catch (error) {
        console.error("sendManualCampaign Error:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro ao disparar campanha." 
        }
    }
}

