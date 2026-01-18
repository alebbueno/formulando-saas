"use server"

import { createClient } from "@/lib/supabase/server"
import { resend } from "@/lib/resend"
import { getInvitationEmailHtml } from "@/lib/email-templates"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

// Helper function to get month name
function getMonthName(date: Date) {
    return date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
}

export async function getAccountStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Fetch all workspaces the user owns
    const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('owner_id', user.id)

    if (!workspaces || workspaces.length === 0) {
        return {
            totalLeads: 0,
            activeForms: 0,
            totalViews: 0,
            conversionRate: 0,
            leadsGrowthData: [],
            workspaceDistributionData: []
        }
    }

    const workspaceIds = workspaces.map(w => w.id)

    // 2. Fetch Aggregated Data
    // a. Fetch projects to count active forms and sum views
    const { data: userProjects, count: formsCount, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, visits, is_published, workspace_id', { count: 'exact' })
        .in('workspace_id', workspaceIds)

    if (projectsError) {
        console.error("Error fetching projects:", projectsError)
    }

    const projects = userProjects || []
    console.log(`[AccountStats] Projects found: ${projects.length} (Total count: ${formsCount}). WorkspaceIDs: ${workspaceIds.join(',')}`)

    // b. Fetch leads
    // We need created_at for the graph, and workspace_id for distribution
    const { data: userLeads, count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('id, created_at, workspace_id', { count: 'exact' })
        .in('workspace_id', workspaceIds)
        .order('created_at', { ascending: true })

    if (leadsError) {
        console.error("Error fetching leads:", leadsError)
    }

    const leads = userLeads || []
    console.log(`[AccountStats] Leads found: ${leads.length} (Total count: ${leadsCount})`)

    // 3. Process Data
    const totalLeads = leadsCount || leads.length
    const activeForms = formsCount || projects.length

    // Calculate Total Views
    const totalViews = projects.reduce((acc, project) => acc + (project.visits || 0), 0)
    console.log(`[AccountStats] Total Views: ${totalViews}`)

    const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : 0

    // 4. Build Lead Growth Data (Last 6 months)
    const growthMap = new Map<string, number>()
    const today = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const key = getMonthName(d) // e.g., 'jan', 'fev'
        // Uppercase first letter
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
        growthMap.set(formattedKey, 0)
    }

    // Populate with actual data
    leads.forEach(lead => {
        const d = new Date(lead.created_at)
        const key = getMonthName(d).charAt(0).toUpperCase() + getMonthName(d).slice(1)

        // Only count if this month key is in our range (simple filter)
        if (growthMap.has(key)) {
            growthMap.set(key, (growthMap.get(key) || 0) + 1)
        }
    })

    const leadsGrowthData = Array.from(growthMap.entries()).map(([name, leads]) => ({ name, leads }))

    // 5. Build Workspace Distribution
    const wsMap = new Map<string, number>()
    workspaces.forEach(w => wsMap.set(w.id, 0))

    leads.forEach(lead => {
        if (wsMap.has(lead.workspace_id)) {
            wsMap.set(lead.workspace_id, (wsMap.get(lead.workspace_id) || 0) + 1)
        }
    })

    const workspaceDistributionData = workspaces
        .map(w => ({
            name: w.name,
            value: wsMap.get(w.id) || 0
        }))
        .filter(w => w.value > 0) // Only show active workspaces with leads
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5

    return {
        totalLeads,
        activeForms,
        totalViews,
        conversionRate,
        leadsGrowthData,
        workspaceDistributionData
    }
}

// --- User Management Actions ---

export type AccountUser = {
    userId: string
    email: string | null
    name: string | null
    role: "owner" | "admin" | "member" | "viewer" | "billing" | "client" // client legacy fallback
    status: "active" | "pending"
    workspaces: {
        id: string
        name: string
        role: "owner" | "admin" | "member" | "viewer" | "billing" | "client"
    }[]
}

export async function getAccountUsers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Get all workspaces owned by current user
    const { data: ownedWorkspaces } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('owner_id', user.id)

    if (!ownedWorkspaces || ownedWorkspaces.length === 0) return []

    const workspaceIds = ownedWorkspaces.map(w => w.id)

    // 2. Get all members of these workspaces
    const { data: members, error } = await supabase
        .from('workspace_members')
        .select(`
            user_id,
            role,
            workspace_id
        `)
        .in('workspace_id', workspaceIds)

    if (error) {
        console.error("Error fetching members:", error)
        return []
    }

    // 3. Get pending invitations for these workspaces (using explicit select on workspace_ids column logic, or simpler: Created by me)
    // The previous migration set column `workspace_ids` as uuid[]. 
    // Supabase query for array contains? .cs('workspace_ids', `{${workspaceIds.join(',')}}`) - wait, intersection check.
    // Simpler: fetch all invitations where I am the inviter.
    const { data: invitations } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .eq('status', 'pending')

    // Unify by User ID
    const userMap = new Map<string, AccountUser>()

    // Attempt to fetch profiles (best effort)
    const memberIds = Array.from(new Set(members.map(m => m.user_id)))
    let profilesMap = new Map<string, { email: string, name: string }>()

    try {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, name')
            .in('id', memberIds)

        if (profiles) {
            profiles.forEach((p: any) => profilesMap.set(p.id, { email: p.email, name: p.name }))
        }
    } catch (e) {
        console.warn("Could not fetch profiles", e)
    }

    // 0. Add Owner (Current User) explicit entry
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single()

    userMap.set(user.id, {
        userId: user.id,
        email: ownerProfile?.email || user.email || "",
        name: ownerProfile?.name || user.user_metadata?.full_name || "Eu (Owner)",
        role: "owner",
        status: "active",
        workspaces: ownedWorkspaces.map(w => ({ id: w.id, name: w.name, role: 'owner' }))
    })

    // Process Members
    members.forEach((m: any) => {
        // Skip owner if they are in members table (we already added them with full access)
        if (m.user_id === user.id) return

        if (!userMap.has(m.user_id)) {
            const profile = profilesMap.get(m.user_id)
            userMap.set(m.user_id, {
                userId: m.user_id,
                email: profile?.email || "Email não encontrado",
                name: profile?.name || "Sem nome",
                role: "member",
                status: "active",
                workspaces: []
            })
        }

        const u = userMap.get(m.user_id)!
        const wsName = ownedWorkspaces.find(w => w.id === m.workspace_id)?.name || "Unknown"

        // Avoid duplicate workspaces if data is messy
        if (!u.workspaces.some(w => w.id === m.workspace_id)) {
            u.workspaces.push({
                id: m.workspace_id,
                name: wsName,
                role: m.role
            })
        }
    })

    // Process Invitations
    if (invitations) {
        invitations.forEach((inv: any) => {
            // Using invitation ID as temporary userId key
            const tempId = `invitation-${inv.id}`

            // Map the invite's workspace IDs to names
            const inviteWorkspaces = (inv.workspace_ids || []).map((id: string) => ({
                id,
                name: ownedWorkspaces.find(w => w.id === id)?.name || "Unknown",
                role: inv.role
            }))

            userMap.set(tempId, {
                userId: tempId,
                email: inv.email,
                name: "Convidado (Pendente)",
                role: inv.role as any,
                status: "pending",
                workspaces: inviteWorkspaces
            })
        })
    }

    // Recalculate roles based on workspace roles
    const finalUsers = Array.from(userMap.values()).map(u => {
        if (u.role === 'owner') return u;

        // If user has ANY admin or member role, they are a "Team Member" (Colaborador)
        const isTeamMember = u.workspaces.some(w => ['owner', 'admin', 'member'].includes(w.role))

        if (isTeamMember) {
            return { ...u, role: 'member' } as AccountUser
        }

        // Otherwise they are a client (Viewer or Billing)
        // We can just take the first role or define a hierarchy. 
        // For the main list, 'client' covers both. Detailed roles are in badges.
        // Or we can return the specific role if they are uniform.
        const firstRole = u.workspaces[0]?.role
        return {
            ...u,
            role: (firstRole === 'billing' ? 'billing' : 'viewer') // default to viewer/client bucket
        } as AccountUser
    })

    return finalUsers
}

export async function inviteAccountUser(email: string, role: string, workspaceIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Unauthorized" }

    // 1. Find user by email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    // 2. If user exists, add normally
    if (profile) {
        const inserts = workspaceIds.map(wsId => ({
            workspace_id: wsId,
            user_id: profile.id,
            role: role
        }))

        const { error: insertError } = await supabase
            .from('workspace_members')
            .insert(inserts)
            .select()

        if (insertError) {
            if (insertError.code === '23505') {
                return { success: false, message: "Este usuário já é membro de um dos workspaces selecionados." }
            }
            console.error("Error adding member:", insertError)
            return { success: false, message: "Erro ao adicionar membro." }
        }

        return { success: true, message: "Usuário adicionado com sucesso!" }
    }

    // 3. If user does NOT exist, create invitation
    // Check for existing pending invitation to avoid duplicates (optional, or just update)
    // We will just insert new one, assuming user might invite to different workspaces.
    // Ideally we merge, but for now simple insert.

    // We need to fetch the inserted ID. The previous insert call didn't chain .select().
    // Let's refactor the insert to return data.

    const { data: inviteData, error: inviteError } = await supabase
        .from('workspace_invitations')
        .insert({
            email,
            role,
            workspace_ids: workspaceIds,
            inviter_id: user.id,
            status: 'pending'
        })
        .select('id')
        .single()

    if (inviteError) {
        console.error("Error creating invitation:", inviteError)
        return { success: false, message: "Erro ao criar convite." }
    }

    // Send Email
    try {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteData.id}`
        const inviterName = user.user_metadata?.full_name || user.email || "Alguém"

        const emailResult = await resend.emails.send({
            from: 'Formulando <noreply@formulando.app>',
            to: email,
            subject: `Você foi convidado para colaborar no Formulando`,
            html: getInvitationEmailHtml({
                inviterName,
                inviteLink
            })
        })

        if (emailResult.error) {
            console.error(`[inviteAccountUser] Resend Error:`, emailResult.error)
        }

    } catch (emailError) {
        console.error("Error sending email:", emailError)
    }

    revalidatePath('/dashboard/account')
    return { success: true, message: "Convite enviado com sucesso!" }
}

export async function updateAccountUser(userId: string, role: string, workspaceIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    // 1. Get all workspaces owned by current user (to prevent unauthorized modifications)
    const { data: ownedWorkspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)

    if (!ownedWorkspaces) return { success: false, message: "No workspaces found" }
    const ownedIds = ownedWorkspaces.map(w => w.id)

    // Filter requested workspaceIds to ensure they are owned by current user
    const validWorkspaceIds = workspaceIds.filter(id => ownedIds.includes(id))

    // 2. Remove from all owned workspaces first (simplest way to sync, though slightly inefficient)
    // Or we can diff. Let's delete from owned workspaces and re-insert.
    // Note: Be careful not to delete the user himself if he mistakenly tries to edit himself? 
    // The UI should prevent editing 'owner' role.

    const { error: deleteError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('user_id', userId)
        .in('workspace_id', ownedIds)

    if (deleteError) {
        console.error("Error updating user (delete phase):", deleteError)
        return { success: false, message: "Erro ao atualizar permissões." }
    }

    if (validWorkspaceIds.length > 0) {
        const inserts = validWorkspaceIds.map(wsId => ({
            workspace_id: wsId,
            user_id: userId,
            role: role
        }))

        const { error: insertError } = await supabase
            .from('workspace_members')
            .insert(inserts)

        if (insertError) {
            console.error("Error updating user (insert phase):", insertError)
            return { success: false, message: "Erro ao re-adicionar permissões." }
        }
    }

    revalidatePath('/dashboard/account')
    return { success: true, message: "Usuário atualizado com sucesso!" }
}



export async function deleteAccountUser(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    // Get owned workspaces to restrain deletion scope
    const { data: ownedWorkspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)

    if (!ownedWorkspaces || ownedWorkspaces.length === 0) return { success: false, message: "No permissions" }
    const ownedIds = ownedWorkspaces.map(w => w.id)

    // Check if it's a pending invitation
    if (userId.startsWith('invitation-')) {
        const invitationId = userId.replace('invitation-', '')

        console.log(`[deleteAccountUser] Removing invitation ${invitationId} for inviter ${user.id}`)

        // Use Admin Client to bypass RLS since we validated ownership via logic
        const supabaseAdmin = createAdminClient()

        const { error, count } = await supabaseAdmin
            .from('workspace_invitations')
            .delete({ count: 'exact' })
            .eq('id', invitationId)
            .eq('inviter_id', user.id)

        console.log(`[deleteAccountUser] Invitation remove result:`, { error, count })

        if (error) {
            console.error("Error removing invitation:", error)
            return { success: false, message: "Erro ao remover convite: " + error.message }
        }

        if (count === 0) {
            console.warn("[deleteAccountUser] Invitation count was 0.")
            return { success: false, message: "Convite não encontrado ou permissão negada." }
        }

        revalidatePath('/dashboard/account')
        return { success: true, message: "Convite removido." }
    }

    console.log(`[deleteAccountUser] Attempting to delete user ${userId} from workspaces:`, ownedIds)

    // Use Admin Client for member deletion too
    const supabaseAdmin = createAdminClient()

    const { error, count } = await supabaseAdmin
        .from('workspace_members')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .in('workspace_id', ownedIds)

    console.log(`[deleteAccountUser] Result:`, { error, count })

    if (error) {
        console.error("Error removing user:", error)
        return { success: false, message: "Erro ao remover usuário: " + error.message }
    }

    if (count === 0) {
        console.warn("[deleteAccountUser] Count was 0. RLS might be blocking or user not in workspace.")
        return { success: false, message: "Usuário não encontrado nos seus workspaces ou permissão negada." }
    }

    revalidatePath('/dashboard/account')
    return { success: true, message: "Usuário removido da equipe." }
}
