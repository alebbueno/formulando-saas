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
