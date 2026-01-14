"use server"

import { createClient } from "@/lib/supabase/server"

export async function uploadFile(formData: FormData, bucket: string = 'landing-page-assets') {
    try {
        const file = formData.get("file") as File
        if (!file) {
            return { error: "Nenhum arquivo enviado" }
        }

        const supabase = await createClient()

        // Verify auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { error: "Não autenticado" }
        }

        // Validate file type (basic)
        const validTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon']
        if (!validTypes.includes(file.type)) {
            return { error: "Tipo de arquivo inválido. Apenas .png e .ico são permitidos." }
        }

        // Validate file size (e.g., 2MB max for favicon)
        if (file.size > 2 * 1024 * 1024) {
            return { error: "Arquivo muito grande. Máximo 2MB." }
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase
            .storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error("Supabase Storage Error:", error)
            return { error: "Erro ao fazer upload da imagem" }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(data.path)

        return { success: true, url: publicUrl }

    } catch (error) {
        console.error("Upload Error:", error)
        return { error: "Erro inesperado no servidor" }
    }
}
