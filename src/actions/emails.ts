"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkLimit } from "@/lib/limits"

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
