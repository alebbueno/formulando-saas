"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface WhatsAppConfig {
    id: string
    workspace_id: string
    phone_number: string
    message_template: string
    is_active: boolean
    position: 'bottom-right' | 'bottom-left'
    button_color: string
    button_text: string
    button_icon: string
    fields_config: any[]
    avatar_url?: string
    icon_type: 'icon' | 'avatar'
}

export async function getWhatsAppConfig(workspaceId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching whatsapp config:", error)
        throw new Error("Failed to fetch config")
    }

    return data as WhatsAppConfig | null
}

export async function updateWhatsAppConfig(workspaceId: string, data: Partial<WhatsAppConfig>) {
    const supabase = await createClient()

    // check if exists
    const existing = await getWhatsAppConfig(workspaceId)

    if (existing) {
        const { error } = await supabase
            .from('whatsapp_configs')
            .update({
                phone_number: data.phone_number,
                message_template: data.message_template,
                is_active: data.is_active,
                position: data.position,
                button_color: data.button_color,
                button_text: data.button_text,
                button_icon: data.button_icon,
                fields_config: data.fields_config,
                avatar_url: data.avatar_url,
                icon_type: data.icon_type,
                updated_at: new Date().toISOString()
            })
            .eq('workspace_id', workspaceId)

        if (error) throw new Error(error.message)
    } else {
        const { error } = await supabase
            .from('whatsapp_configs')
            .insert({
                workspace_id: workspaceId,
                phone_number: data.phone_number || '',
                message_template: data.message_template || '',
                is_active: data.is_active || false,
                position: data.position || 'bottom-right',
                button_color: data.button_color || '#25D366',
                button_text: data.button_text || 'Falar no WhatsApp',
                button_icon: data.button_icon || 'whatsapp',
                avatar_url: data.avatar_url || '',
                icon_type: data.icon_type || 'icon',
                fields_config: data.fields_config || [
                    { name: "name", label: "Nome", type: "text", required: true, order: 1 },
                    { name: "email", label: "Email", type: "email", required: true, order: 2 },
                    { name: "phone", label: "Telefone", type: "tel", required: true, order: 3 }
                ]
            })

        if (error) throw new Error(error.message)
    }

    revalidatePath('/dashboard/whatsapp')
}
