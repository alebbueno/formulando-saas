"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getInvitation(id: string) {
    // We use the admin client because the user might not be logged in yet (public page),
    // and RLS likely restricts reading invitations to the inviter only.
    const supabase = createAdminClient()

    const { data: invitation, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !invitation) {
        console.error("Error fetching invitation:", error)
        return null
    }

    // Fetch workspace names explicitly using admin client too to ensure we can read them
    if (invitation.workspace_ids && invitation.workspace_ids.length > 0) {
        const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id, name')
            .in('id', invitation.workspace_ids)

        return {
            ...invitation,
            workspaces: workspaces || []
        }
    }

    return {
        ...invitation,
        workspaces: []
    }
}

export async function acceptInvitation(data: {
    invitationId: string,
    password?: string,
    name?: string,
    isExistingUser: boolean
}) {
    // Standard client for Auth (handling sign up / session)
    const supabaseAuth = await createClient()

    // Admin client for DB operations (bypass RLS)
    const supabaseAdmin = createAdminClient()

    // 1. Verify Invitation
    const { data: invite, error: inviteError } = await supabaseAdmin
        .from('workspace_invitations')
        .select('*')
        .eq('id', data.invitationId)
        .eq('status', 'pending')
        .single()

    if (inviteError || !invite) {
        return { success: false, error: "Convite inválido ou expirado." }
    }

    let userId = ""

    if (data.isExistingUser) {
        // Authenticate existing user
        const { data: { user } } = await supabaseAuth.auth.getUser()
        // Ensure the logged in user matches the invite email
        // Note: invite.email is reliable from the DB.
        if (!user || user.email !== invite.email) {
            return { success: false, error: `Você deve estar logado como ${invite.email} para aceitar.` }
        }
        userId = user.id
    } else {
        // Create new user via SignUp
        const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
            email: invite.email,
            password: data.password!,
            options: {
                data: {
                    full_name: data.name
                }
            }
        })

        if (authError) {
            return { success: false, error: authError.message }
        }

        if (!authData.user) {
            return { success: false, error: "Erro ao criar usuário." }
        }

        userId = authData.user.id
    }

    // 1.5 Ensure Profile Exists (Fix for Race Condition/Missing Trigger)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

    if (!profile) {
        console.log("Profile not found (trigger delay?), creating manually for:", userId)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email: invite.email,
                full_name: data.name || data.isExistingUser ? undefined : emailToName(invite.email), // Fallback name
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error("Error creating profile manually:", profileError)
            // Continue anyway? If it fails, the next step might fail too, but maybe it exists now?
            // If error is duplicate, it matches race condition, so we are good.
            if (profileError.code !== '23505') {
                return { success: false, error: "Erro ao criar perfil de usuário." }
            }
        }
    }

    // 2. Add to Workspace Members (Using Admin to bypass "only admin can add members" rules)
    const inserts = (invite.workspace_ids as string[]).map(wsId => ({
        workspace_id: wsId,
        user_id: userId,
        role: invite.role
    }))

    const { error: memberError } = await supabaseAdmin
        .from('workspace_members')
        .insert(inserts)

    if (memberError) {
        // If 'existing user' already in workspace, we might get error, but let's handle gracefuly
        if (memberError.code !== '23505') { // Unique constraint
            console.error("Error adding to workspace:", memberError)
            return { success: false, error: "Erro ao adicionar ao workspace." }
        }
    }

    // 3. Update Invitation Status (Using Admin)
    await supabaseAdmin
        .from('workspace_invitations')
        .update({ status: 'accepted' })
        .eq('id', invite.id)

    return { success: true }
}

function emailToName(email: string) {
    return email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
