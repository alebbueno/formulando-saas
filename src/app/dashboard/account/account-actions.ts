"use server"

import { createClient } from "@/lib/supabase/server"

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
    // We'll run parallel queries for efficiency

    // a. Count total forms (projects)
    const formsPromise = supabase
        .from('projects')
        .select('id, views_count', { count: 'exact' }) // Assuming views_count exists, if not we'll handle it
        .in('workspace_id', workspaceIds)

    // b. Fetch leads
    // We need created_at for the graph, and workspace_id for distribution
    const leadsPromise = supabase
        .from('leads')
        .select('id, created_at, workspace_id')
        .in('workspace_id', workspaceIds)
        .order('created_at', { ascending: true })

    const [formsRes, leadsRes] = await Promise.all([formsPromise, leadsPromise])

    const forms = formsRes.data || []
    const leads = leadsRes.data || []

    // 3. Process Data
    const totalLeads = leads.length
    const activeForms = formsRes.count || 0

    // Calculate Views (assuming a column, otherwise 0)
    // If 'views_count' doesn't exist, this will just be undefined/0. 
    // In a real app we'd need to verify schema. 
    // For now, let's assume it exists or use a random multiplier for demo if explicit field missing?
    // Let's safe guard.
    const totalViews = forms.reduce((acc, form) => acc + (form.views_count || 0), 0)

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
        // Only count if within last ~6 months roughly
        // Ideally we filter in DB, but JS filter is fine for MVP volume
        const key = getMonthName(d).charAt(0).toUpperCase() + getMonthName(d).slice(1)
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
        .filter(w => w.value > 0) // Only show active workspaces
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
    role: "owner" | "admin" | "member" | "client"
    status: "active" | "pending"
    workspaces: {
        id: string
        name: string
        role: "owner" | "admin" | "member" | "client"
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

    // Process Members
    members.forEach((m: any) => {
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

        u.workspaces.push({
            id: m.workspace_id,
            name: wsName,
            role: m.role
        })
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

    return Array.from(userMap.values())
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

    const { error: inviteError } = await supabase
        .from('workspace_invitations')
        .insert({
            email,
            role,
            workspace_ids: workspaceIds, // Stored as array
            inviter_id: user.id,
            status: 'pending'
        })

    if (inviteError) {
        console.error("Error creating invitation:", inviteError)
        return { success: false, message: "Erro ao criar convite." }
    }

    // Here you would trigger an email sending service
    // await sendInvitationEmail(email, ...)

    return { success: true, message: "Convite enviado! O usuário terá acesso assim que se cadastrar com este e-mail." }
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

    const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('user_id', userId)
        .in('workspace_id', ownedIds)

    if (error) {
        console.error("Error removing user:", error)
        return { success: false, message: "Erro ao remover usuário." }
    }

    return { success: true, message: "Usuário removido da equipe." }
}
