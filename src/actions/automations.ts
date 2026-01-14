"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAutomations(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data, error } = await supabase
        .from("automations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching automations:", error)
        return []
    }

    return data
}

export async function getAutomation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data, error } = await supabase
        .from("automations")
        .select("*")
        .eq("id", id)
        .single()

    if (error) return null

    return data
}

export async function createAutomation(name: string, workspaceId: string, formId?: string, templateId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    let flowData: any = { nodes: [], edges: [] }

    // Template Logic
    switch (templateId) {
        case 'simple-email':
            flowData = {
                nodes: [
                    { id: 'trigger', type: 'trigger', position: { x: 50, y: 300 }, data: { label: 'Gatilho: Form Enviado', nodeType: 'trigger', config: { formId } } },
                    { id: 'email', type: 'action_email', position: { x: 350, y: 300 }, data: { label: 'Enviar Email', nodeType: 'action_email' } }
                ],
                edges: [{ id: 'e1', source: 'trigger', target: 'email', sourceHandle: null, targetHandle: null }]
            }
            break;
        case 'tag-qualify':
            flowData = {
                nodes: [
                    { id: 'trigger', type: 'trigger', position: { x: 50, y: 300 }, data: { label: 'Gatilho: Form Enviado', nodeType: 'trigger', config: { formId } } },
                    { id: 'tag', type: 'action_tag', position: { x: 350, y: 300 }, data: { label: '🏷️ Adicionar Tag', nodeType: 'action_tag', config: { tags: ["Novo Lead"] } } },
                    { id: 'status', type: 'action_status', position: { x: 650, y: 300 }, data: { label: '🔄 Mudar Status', nodeType: 'action_status', config: { status: "Qualificado" } } }
                ],
                edges: [
                    { id: 'e1', source: 'trigger', target: 'tag', sourceHandle: null, targetHandle: null },
                    { id: 'e2', source: 'tag', target: 'status', sourceHandle: null, targetHandle: null }
                ]
            }
            break;
        case 'webhook-integration':
            flowData = {
                nodes: [
                    { id: 'trigger', type: 'trigger', position: { x: 50, y: 300 }, data: { label: 'Gatilho: Form Enviado', nodeType: 'trigger', config: { formId } } },
                    { id: 'webhook', type: 'action_webhook', position: { x: 350, y: 300 }, data: { label: '🔗 Webhook', nodeType: 'action_webhook' } }
                ],
                edges: [{ id: 'e1', source: 'trigger', target: 'webhook', sourceHandle: null, targetHandle: null }]
            }
            break;
        default: // 'scratch' or unknown
            flowData = {
                nodes: [
                    {
                        id: 'trigger-1',
                        type: 'trigger',
                        position: { x: 50, y: 300 },
                        data: { label: 'Form Enviado', nodeType: 'trigger', config: { formId } }
                    }
                ],
                edges: []
            }
            break;
    }

    const { data, error } = await supabase
        .from("automations")
        .insert({
            name,
            workspace_id: workspaceId,
            trigger_type: 'form_submission',
            trigger_config: formId ? { formId } : {},
            flow_data: flowData,
            is_active: false
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath("/dashboard/automations")
    return { success: true, id: data.id }
}

export async function updateAutomationFlow(id: string, flowData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Optimize execution graph here if needed
    // const executionGraph = optimizeGraph(flowData)

    const { error } = await supabase
        .from("automations")
        .update({ flow_data: flowData, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/automations/${id}`)
    return { success: true }
}

export async function toggleAutomation(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from("automations")
        .update({ is_active: isActive })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/dashboard/automations")
    revalidatePath(`/dashboard/automations/${id}`)
    return { success: true }
}

export async function deleteAutomation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/dashboard/automations")
    return { success: true }
}
