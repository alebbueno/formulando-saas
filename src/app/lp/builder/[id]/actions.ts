"use server"

import { createClient } from "@/lib/supabase/server"
import { LPElement } from "@/components/lp-builder/types"
import { revalidatePath } from "next/cache"
import { addDomainToVercel, removeDomainFromVercel, validDomainRegex } from "@/lib/domains"

export async function saveLandingPage(id: string, content: LPElement[], name?: string, slug?: string, settings?: any) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: "Não autenticado"
            }
        }

        // Verify ownership
        const { data: landingPage, error: lpError } = await supabase
            .from("landing_pages")
            .select("workspace_id")
            .eq("id", id)
            .single()

        if (lpError || !landingPage) {
            return {
                success: false,
                error: "Landing Page não encontrada"
            }
        }

        // Check workspace ownership
        const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("id")
            .eq("id", landingPage.workspace_id)
            .eq("owner_id", user.id)
            .single()

        if (workspaceError || !workspace) {
            return {
                success: false,
                error: "Acesso negado"
            }
        }

        // Save the content
        const { error: updateError } = await supabase
            .from("landing_pages")
            .update({
                content: content,
                ...(name && { name }), // Only update name if provided
                ...(slug && { slug }), // Only update slug if provided
                ...(settings && { settings }), // Only update settings if provided
                updated_at: new Date().toISOString()
            })
            .eq("id", id)

        if (updateError) {
            console.error("Error saving landing page:", updateError)
            return {
                success: false,
                error: "Erro ao salvar"
            }
        }

        // Revalidate the page cache
        revalidatePath(`/lp/builder/${id}`)

        return {
            success: true,
            savedAt: new Date().toISOString()
        }
    } catch (error) {
        console.error("Unexpected error saving landing page:", error)
        return {
            success: false,
            error: "Erro inesperado ao salvar"
        }
    }
}

export async function togglePublish(id: string, isPublished: boolean) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: "Não autenticado"
            }
        }

        // Verify ownership
        const { data: landingPage, error: lpError } = await supabase
            .from("landing_pages")
            .select("workspace_id, slug")
            .eq("id", id)
            .single()

        if (lpError || !landingPage) {
            return {
                success: false,
                error: "Landing Page não encontrada"
            }
        }

        // Check workspace ownership
        const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("id")
            .eq("id", landingPage.workspace_id)
            .eq("owner_id", user.id)
            .single()

        if (workspaceError || !workspace) {
            return {
                success: false,
                error: "Acesso negado"
            }
        }

        // Toggle publish status
        const { error: updateError } = await supabase
            .from("landing_pages")
            .update({
                is_published: isPublished,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)

        if (updateError) {
            console.error("Error toggling publish status:", updateError)
            return {
                success: false,
                error: "Erro ao atualizar status"
            }
        }

        // Revalidate the public page
        revalidatePath(`/lp/${landingPage.slug}`)
        revalidatePath(`/lp/builder/${id}`)

        return {
            success: true,
            isPublished,
            slug: landingPage.slug
        }
    } catch (error) {
        console.error("Unexpected error toggling publish:", error)
        return {
            success: false,
            error: "Erro inesperado"
        }
    }
}

export async function updateProjectDomain(id: string, domain: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { error: "Não autenticado" }

        // Clean domain
        const cleanDomain = domain.trim().toLowerCase()

        if (cleanDomain && !validDomainRegex.test(cleanDomain)) {
            return { error: "Domínio inválido. Ex: promo.sualoja.com.br" }
        }

        // Verify ownership
        const { data: lp } = await supabase
            .from("landing_pages")
            .select("workspace_id, custom_domain")
            .eq("id", id)
            .single()

        if (!lp) return { error: "LP não encontrada" }

        // (Add Workspace ownership check here if needed, but RLS usually handles it if using supabase properly)
        // Leaving explicit check out for brevity as `update` will fail with RLS if not owner, 
        // but explicitly checking is safer for Logic.
        // Re-using the logic from saveLandingPage...
        const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("id", lp.workspace_id)
            .eq("owner_id", user.id)
            .single()

        if (!workspace) return { error: "Acesso negado" }

        // Check if domain is taken (by another LP)
        if (cleanDomain) {
            const { data: existing } = await supabase
                .from("landing_pages")
                .select("id")
                .eq("custom_domain", cleanDomain)
                .neq("id", id)
                .single()

            if (existing) {
                return { error: "Este domínio já está em uso em outra página." }
            }
        }

        // Handle Vercel Integration
        try {
            // If there was an old domain and it's different, remove it?
            // Actually, we should only remove if we are SURE it's not used elsewhere? 
            // But custom_domain is unique, so yes.
            // CAUTION: Removing domain from Vercel might be risky if we share domains across projects?
            // But usually 1 Custom Domain = 1 Project.
            // If user clears the domain, we remove it.

            if (lp.custom_domain && lp.custom_domain !== cleanDomain) {
                await removeDomainFromVercel(lp.custom_domain)
            }

            if (cleanDomain) {
                await addDomainToVercel(cleanDomain)
            }
        } catch (error: any) {
            console.error("Vercel API Error:", error)
            return { error: `Erro ao configurar domínio na Vercel: ${error.message}` }
        }

        // Update DB
        const { error: updateError } = await supabase
            .from("landing_pages")
            .update({
                custom_domain: cleanDomain || null,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)

        if (updateError) {
            console.error(updateError)
            return { error: "Erro ao salvar no banco de dados." }
        }

        revalidatePath(`/lp/builder/${id}`)
        return { success: true }

    } catch (error: any) {
        console.error(error)
        return { error: "Erro inesperado ao atualizar domínio" }
    }
}
