"use server"

import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

// ==========================================
// API TOKENS
// ==========================================

export async function getApiTokens(workspaceId: string) {
    const supabase = await createClient()

    const { data: tokens, error } = await supabase
        .from("api_tokens")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching api tokens:", error)
        return []
    }

    return tokens
}

export async function generateApiToken(workspaceId: string, name: string) {
    const supabase = await createClient()

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')

    const { data, error } = await supabase
        .from("api_tokens")
        .insert({
            workspace_id: workspaceId,
            name,
            token
        })
        .select("*")
        .single()

    if (error) {
        throw new Error("Erro ao gerar token de API")
    }

    revalidatePath(`/workspace/${workspaceId}/integrations`)

    // We return the raw token ONLY once upon creation so the user can copy it
    return { ...data, raw_token: token }
}

export async function deleteApiToken(tokenId: string, workspaceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("api_tokens")
        .delete()
        .eq("id", tokenId)
        .eq("workspace_id", workspaceId)

    if (error) {
        throw new Error("Erro ao revogar token")
    }

    revalidatePath(`/workspace/${workspaceId}/integrations`)
}

// ==========================================
// WEBHOOKS
// ==========================================

export type WebhookConfig = {
    id: string
    workspace_id: string
    name: string
    url: string
    secret?: string
    is_active: boolean
    events: string[]
    created_at: string
}

export async function getWebhooks(workspaceId: string) {
    const supabase = await createClient()

    const { data: webhooks, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching webhooks:", error)
        return []
    }

    return webhooks as WebhookConfig[]
}

export async function createWebhook(workspaceId: string, data: { name: string, url: string, secret?: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("webhooks")
        .insert({
            workspace_id: workspaceId,
            name: data.name,
            url: data.url,
            secret: data.secret || null,
            events: ['lead.created']
        })

    if (error) {
        throw new Error("Erro ao criar webhook")
    }

    revalidatePath(`/workspace/${workspaceId}/integrations`)
}

export async function toggleWebhook(webhookId: string, workspaceId: string, isActive: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("webhooks")
        .update({ is_active: isActive })
        .eq("id", webhookId)
        .eq("workspace_id", workspaceId)

    if (error) {
        throw new Error("Erro ao alternar status do webhook")
    }

    revalidatePath(`/workspace/${workspaceId}/integrations`)
}

export async function deleteWebhook(webhookId: string, workspaceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId)
        .eq("workspace_id", workspaceId)

    if (error) {
        throw new Error("Erro ao remover webhook")
    }

    revalidatePath(`/workspace/${workspaceId}/integrations`)
}
