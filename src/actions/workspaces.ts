"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type KanbanColumn = {
    id: string
    label: string
    color: string
    bg: string
}

export async function updateWorkspaceKanbanColumns(workspaceId: string, columns: KanbanColumn[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    // Verify ownership or admin role
    const { data: member } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single()

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Permissão negada. Apenas administradores podem alterar as colunas.")
    }

    const { error } = await supabase
        .from("workspaces")
        .update({ kanban_columns: columns })
        .eq("id", workspaceId)

    if (error) {
        console.error("Error updating kanban columns:", error)
        throw new Error("Erro ao salvar colunas")
    }

    revalidatePath("/dashboard/leads")
}
