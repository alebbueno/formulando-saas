"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export type KanbanColumn = {
    id: string
    label: string
    color: string
    bg: string
}

export async function updateWorkspaceKanbanColumns(workspaceId: string, columns: KanbanColumn[]) {
    // console.log("Updating columns for workspace:", workspaceId)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    // Verify ownership or admin role
    const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single()

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Permissão negada. Apenas administradores podem alterar as colunas.")
    }

    // Use Admin Client to bypass RLS for the update
    const adminSupabase = createAdminClient()
    const { error, data } = await adminSupabase
        .from("workspaces")
        .update({ kanban_columns: columns })
        .eq("id", workspaceId)
        .select()

    if (error) {
        console.error("Error updating kanban columns:", error)
        throw new Error("Erro ao salvar colunas")
    }

    if (!data || data.length === 0) {
        console.error("No workspace updated. ID:", workspaceId)
        throw new Error("Falha ao atualizar: Workspace não encontrado ou permissão negada.")
    }

    revalidatePath("/dashboard/leads")
}
