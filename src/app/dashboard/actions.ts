"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { ProjectType } from "@/types"
import { checkLimit } from "@/lib/limits"

// Helper to get user or redirect
async function getUserOrRedirect() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }
    return { user, supabase }
}

export async function setActiveWorkspaceCookie(workspaceId: string) {
    const cookieStore = await cookies()
    cookieStore.set("formu-workspace-id", workspaceId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
    })
}

export async function createWorkspace(data: { name: string; slug: string }) {
    const { user, supabase } = await getUserOrRedirect()

    // Validate slug uniqueness globally
    const { data: existing } = await supabase
        .from("workspaces")
        .select("id")
        .eq("slug", data.slug)
        .single()

    if (existing) {
        return { error: "Este identificador já está em uso." }
    }

    // Insert workspace
    const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert({
            name: data.name,
            slug: data.slug,
            owner_id: user.id
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error creating workspace:", error)
        return { error: "Erro ao criar marca. Tente novamente." }
    }

    revalidatePath("/dashboard")
    return { id: workspace.id }
}

export async function updateWorkspaceName(id: string, name: string) {
    const { user, supabase } = await getUserOrRedirect()

    // Verify ownership
    const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single()

    if (wsError || !workspace) {
        return { error: "Você não tem permissão para alterar esta marca." }
    }

    // Use Admin Client to bypass RLS for the update
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from("workspaces")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) {
        console.error("Error updating workspace:", error)
        return { error: "Erro ao atualizar marca." }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function updateWorkspaceEmailSettings(
    id: string,
    senderEmail: string | null,
    senderName: string | null
) {
    const { user, supabase } = await getUserOrRedirect()

    // Verify ownership
    const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single()

    if (wsError || !workspace) {
        return { error: "Você não tem permissão para alterar esta marca." }
    }

    // Use Admin Client to bypass RLS for the update
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from("workspaces")
        .update({
            sender_email: senderEmail || null,
            sender_name: senderName || null,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)

    if (error) {
        console.error("Error updating workspace email settings:", error)
        return { error: "Erro ao atualizar configurações de email." }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function createProject() {
    const { user, supabase } = await getUserOrRedirect()

    // Try to get workspace from cookie
    const cookieStore = await cookies()
    let workspaceId = cookieStore.get("formu-workspace-id")?.value

    if (!workspaceId) {
        // Fallback: fetch first workspace
        const { data: workspaces } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", user.id)
            .limit(1)

        if (workspaces && workspaces.length > 0) {
            workspaceId = workspaces[0].id
        } else {
            // Create default workspace if absolutely none exist
            // TODO: Checking workspace creation limit here effectively?
            // For now, allow default creation if none exists.

            const { data: newWorkspace, error: workspaceError } = await supabase
                .from("workspaces")
                .insert({
                    name: "My Workspace",
                    slug: `workspace-${user.id.slice(0, 8)}`,
                    owner_id: user.id,
                })
                .select("id")
                .single()

            if (workspaceError || !newWorkspace) {
                console.error("Error creating default workspace:", workspaceError)
                throw new Error("Falha ao criar workspace padrão.")
            }
            workspaceId = newWorkspace.id
        }
    }

    if (!workspaceId) {
        throw new Error("No workspace found")
    }

    // CHECK LIMITS
    const limitCheck = await checkLimit(workspaceId, "forms")
    if (!limitCheck.allowed) {
        throw new Error(limitCheck.error || "Limite de formulários atingido para o seu plano.")
    }

    // Create new project
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
            workspace_id: workspaceId,
            name: "Formulário Sem Título",
            slug: `form-${crypto.randomUUID().slice(0, 8)}`,
            content: [], // Empty form array
            settings: {},
            is_published: false,
        })
        .select("id")
        .single()

    if (projectError) {
        console.error("Error creating project:", projectError)
        throw new Error("Failed to create project")
    }

    revalidatePath("/dashboard")
    redirect(`/builder/${project.id}`)
}

export async function createLandingPage() {
    const { user, supabase } = await getUserOrRedirect()
    const cookieStore = await cookies()
    let workspaceId = cookieStore.get("formu-workspace-id")?.value

    // Simple workspace fallback
    if (!workspaceId) {
        const { data: workspaces } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1)
        workspaceId = workspaces?.[0]?.id
    }

    if (!workspaceId) throw new Error("No workspace found")

    // CHECK LIMITS
    const limitCheck = await checkLimit(workspaceId, "landing_pages")
    if (!limitCheck.allowed) {
        throw new Error(limitCheck.error || "Limite de Landing Pages atingido para o seu plano.")
    }

    const { data: lp, error } = await supabase
        .from("landing_pages")
        .insert({
            workspace_id: workspaceId,
            name: "Landing Page Nova",
            slug: `lp-${crypto.randomUUID().slice(0, 8)}`,
            content: [],
            is_published: false,
            settings: {}
        })
        .select("id")
        .single()

    if (error) {
        console.error(error)
        throw new Error("Failed to create landing page")
    }

    revalidatePath("/dashboard/lp")
    redirect(`/lp/builder/${lp.id}`)
}

export async function deleteLandingPage(id: string) {
    const { user, supabase } = await getUserOrRedirect()

    // Verify ownership implicitly by checking owner matches workspace owner
    // First get the LP and its workspace
    const { data: lp, error: fetchError } = await supabase
        .from("landing_pages")
        .select("workspace_id")
        .eq("id", id)
        .single()

    if (fetchError || !lp) {
        throw new Error("Landing Page not found")
    }

    // Verify workspace ownership
    const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", lp.workspace_id)
        .eq("owner_id", user.id)
        .single()

    if (wsError || !workspace) {
        throw new Error("Unauthorized")
    }

    // Delete
    const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id)

    if (error) {
        throw new Error("Failed to delete landing page")
    }

    revalidatePath("/dashboard/lp")
}
