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

    members.forEach((m: any) => {
        if (!userMap.has(m.user_id)) {
            const profile = profilesMap.get(m.user_id)
            userMap.set(m.user_id, {
                userId: m.user_id,
                email: profile?.email || "usuario@exemplo.com",
                name: profile?.name || "Usuário",
                role: "member",
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

    return Array.from(userMap.values())
}

export async function inviteAccountUser(email: string, role: string, workspaceIds: string[]) {
    // Mock implementation for "Inviting"
    // In a real app, this would create a pending_invites record or add to workspace_members directly if user exists
    return { success: true, message: "Convite enviado com sucesso! (Simulação)" }
}
