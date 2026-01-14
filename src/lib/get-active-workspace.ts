import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function getActiveWorkspace() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const cookieStore = await cookies()
    const workspaceId = cookieStore.get("formu-workspace-id")?.value

    let activeWorkspaceId = workspaceId

    // 1. Fetch Owned Workspaces
    const { data: ownedWorkspaces } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("owner_id", user.id)

    // 2. Fetch Member Workspaces
    const { data: memberWorkspaces } = await supabase
        .from("workspace_members")
        .select("workspace:workspaces(id, name)")
        .eq("user_id", user.id)

    // 3. Combine
    const workspaces = [
        ...(ownedWorkspaces || []),
        ...(memberWorkspaces?.map((m: any) => m.workspace).filter(Boolean) || [])
    ]

    // Deduplicate
    const uniqueWorkspacesMap = new Map()
    workspaces.forEach(w => uniqueWorkspacesMap.set(w.id, w))
    const allWorkspaces = Array.from(uniqueWorkspacesMap.values())

    // If no workspaceId in cookie, or invalid, pick the first one
    if (!activeWorkspaceId && allWorkspaces.length > 0) {
        activeWorkspaceId = allWorkspaces[0].id
    }

    // Verify access
    if (activeWorkspaceId && allWorkspaces.length > 0) {
        const hasAccess = allWorkspaces.some(w => w.id === activeWorkspaceId)
        if (!hasAccess) {
            activeWorkspaceId = allWorkspaces[0].id
        }
    }

    return { activeWorkspace: allWorkspaces.find(w => w.id === activeWorkspaceId), allWorkspaces }
}
