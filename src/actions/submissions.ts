"use server"

import { createClient } from "@/lib/supabase/server"

export interface Submission {
    id: string
    project_id: string
    project_name?: string
    data: Record<string, any>
    created_at: string
}

export interface GetSubmissionsParams {
    projectId?: string
    search?: string
    orderBy?: 'created_at' | 'project_id'
    orderDirection?: 'asc' | 'desc'
    page?: number
    pageSize?: number
}

export async function getSubmissions(params: GetSubmissionsParams = {}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const {
        projectId,
        search,
        orderBy = 'created_at',
        orderDirection = 'desc',
        page = 1,
        pageSize = 10
    } = params

    // Start building the query
    // Rely on RLS for user access control.
    let query = supabase
        .from('form_submissions')
        .select(`
            *,
            projects (
                name,
                workspace_id
            )
        `, { count: 'exact' })

    // Filter by project if provided
    if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId)
    }

    // Search functionality
    if (search) {
        // Search in the JSONB 'data' column. 
        // This is a simple text search cast to text. Ideally, use more specific keys or full text search.
        // For MVP, casting to text and ilike is acceptable for moderate datasets.
        query = query.or(`data.ilike.%${search}%`)
    }

    // Sorting
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error("Error fetching submissions:", error)
        throw new Error("Erro ao buscar submissões")
    }

    // Map and flatten the result
    const submissions = data.map((sub: any) => ({
        id: sub.id,
        project_id: sub.project_id,
        project_name: sub.projects?.name,
        data: sub.data,
        created_at: sub.created_at
    }))

    return {
        submissions,
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
    }
}

export async function getProjectsList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // Get projects the user has access to
    // We can rely on RLS, but explicit query is good for dropdowns
    const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name')

    if (error) {
        console.error("Error fetching projects:", error)
        return []
    }

    return data
}
