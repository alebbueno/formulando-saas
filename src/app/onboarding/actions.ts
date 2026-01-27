"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function createOnboardingWorkspace(data: {
    name: string
    usage: string | null
    goal: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Generate slug
    const baseSlug = data.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanum with dashes
        .replace(/^-+|-+$/g, "") // trim dashes

    const randomSuffix = Math.floor(Math.random() * 10000)
    const slug = `${baseSlug}-${randomSuffix}`

    // Get FREE plan ID
    const { data: freePlan } = await supabase
        .from("plans")
        .select("id")
        .eq("slug", "free")
        .single()

    // Create workspace
    const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert({
            name: data.name,
            slug: slug,
            owner_id: user.id,
            plan_id: freePlan?.id, // Link to Free plan
            subscription_status: 'free'
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error creating onboarding workspace:", error)
        return { error: "Erro ao criar workspace" }
    }

    // Explicitly add owner to workspace_members to ensure RLS works for subsequent inserts
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "owner"
        })

    if (memberError) {
        console.error("Error adding member to workspace:", memberError)
        // Continue anyway as some triggers might have handled it, but log it.
    }

    // Set active workspace cookie
    const cookieStore = await cookies()
    cookieStore.set("formu-workspace-id", workspace.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
    })

    return { success: true, workspaceId: workspace.id }
}

export async function createOnboardingProject() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const cookieStore = await cookies()
    let workspaceId = cookieStore.get("formu-workspace-id")?.value

    if (!workspaceId) {
        // Fallback: Fetch the most recently created workspace for this user
        const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

        if (workspace) {
            workspaceId = workspace.id
        }
    }

    if (!workspaceId) {
        console.error("CreateOnboardingProject: No workspace found for user", user.id)
        throw new Error("No workspace found")
    }

    const { data: project, error } = await supabase
        .from("projects")
        .insert({
            workspace_id: workspaceId,
            name: "Meu Primeiro Formulário",
            slug: `form-${crypto.randomUUID().slice(0, 8)}`,
            content: [],
            settings: {},
            is_published: false,
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error creating onboarding project:", error)
        throw new Error("Failed to create project")
    }

    redirect(`/builder/${project.id}?onboarding=true`)
}

export async function createOnboardingLP() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const cookieStore = await cookies()
    let workspaceId = cookieStore.get("formu-workspace-id")?.value

    if (!workspaceId) {
        // Fallback
        const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

        if (workspace) {
            workspaceId = workspace.id
        }
    }

    if (!workspaceId) throw new Error("No workspace found")

    // Create LP
    const { data: lp, error } = await supabase
        .from("landing_pages")
        .insert({
            workspace_id: workspaceId,
            name: "Minha Primeira Landing Page",
            slug: `lp-${crypto.randomUUID().slice(0, 8)}`,
            content: [],
            is_published: false,
            settings: {}
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error creating onboarding LP:", error)
        throw new Error("Failed to create landing page")
    }

    redirect(`/lp/builder/${lp.id}?onboarding=true`)
}
