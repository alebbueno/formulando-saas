"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { FormElementInstance } from "@/context/builder-context"

export async function updateProjectContent(id: string, jsonContent: string, name?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found")

    const updateData: any = {
        content: JSON.parse(jsonContent),
    }

    if (name) {
        updateData.name = name
    }

    const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/builder/${id}`)
    revalidatePath("/dashboard")
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found")

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard")
}

export async function submitForm(formUrl: string, content: string) {
    const supabase = await createClient()

    // We don't check for user here, as this is a public action

    // Validate that the project exists
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", formUrl)
        .single()

    if (projectError || !project) {
        throw new Error("Formulário não encontrado")
    }

    const { error } = await supabase
        .from("leads")
        .insert({
            project_id: formUrl,
            data: JSON.parse(content),
        })

    if (error) {
        console.error("Error submitting form:", error)
        throw new Error("Erro ao enviar formulário")
    }
}

export async function getTemplates() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching templates:", error)
        throw new Error("Erro ao buscar templates")
    }

    return data || []
}

export async function generateFormWithAI(prompt: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    try {
        // TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
        // For now, we'll create a simple rule-based generator
        
        const elements = generateFormElementsFromPrompt(prompt)
        
        return {
            success: true,
            elements,
        }
    } catch (error) {
        console.error("Error generating form with AI:", error)
        return {
            success: false,
            error: "Erro ao gerar formulário. Tente novamente."
        }
    }
}

// Simple rule-based form generator (to be replaced with actual AI)
function generateFormElementsFromPrompt(prompt: string): FormElementInstance[] {
    const lowerPrompt = prompt.toLowerCase()
    const elements: FormElementInstance[] = []
    let idCounter = 0

    const generateId = () => `ai-${Date.now()}-${idCounter++}`

    // Add title
    elements.push({
        id: generateId(),
        type: "TitleField",
        extraAttributes: {
            title: extractTitle(prompt) || "Formulário"
        }
    })

    // Add description
    elements.push({
        id: generateId(),
        type: "ParagraphField",
        extraAttributes: {
            text: "Preencha os dados abaixo para continuar."
        }
    })

    // Always add name field
    elements.push({
        id: generateId(),
        type: "NameField",
        extraAttributes: {
            label: "Nome Completo",
            helperText: "Digite seu nome completo",
            required: true,
            placeHolder: "Seu nome aqui"
        }
    })

    // Always add email field
    elements.push({
        id: generateId(),
        type: "EmailField",
        extraAttributes: {
            label: "E-mail",
            helperText: "Digite seu e-mail",
            required: true,
            placeHolder: "seu@email.com"
        }
    })

    // Add phone if mentioned
    if (lowerPrompt.includes("telefone") || lowerPrompt.includes("contato") || lowerPrompt.includes("whatsapp")) {
        elements.push({
            id: generateId(),
            type: "PhoneField",
            extraAttributes: {
                label: "Telefone",
                helperText: "Digite seu número de telefone",
                required: true,
                placeHolder: "(00) 00000-0000"
            }
        })
    }

    // Add specific fields based on prompt
    if (lowerPrompt.includes("lead") || lowerPrompt.includes("captar") || lowerPrompt.includes("contato")) {
        elements.push({
            id: generateId(),
            type: "TextArea",
            extraAttributes: {
                label: "Mensagem",
                helperText: "Como podemos ajudar?",
                required: true,
                placeHolder: "Digite sua mensagem...",
                rows: 4
            }
        })
    }

    if (lowerPrompt.includes("evento") || lowerPrompt.includes("inscrição")) {
        elements.push({
            id: generateId(),
            type: "DateField",
            extraAttributes: {
                label: "Data do Evento",
                helperText: "Selecione a data",
                required: true
            }
        })
    }

    if (lowerPrompt.includes("venda") || lowerPrompt.includes("orçamento") || lowerPrompt.includes("cotação")) {
        elements.push({
            id: generateId(),
            type: "TextField",
            extraAttributes: {
                label: "Produto/Serviço de Interesse",
                helperText: "Qual produto ou serviço você precisa?",
                required: true,
                placeHolder: "Descreva o produto ou serviço"
            }
        })
    }

    if (lowerPrompt.includes("pesquisa") || lowerPrompt.includes("feedback") || lowerPrompt.includes("satisfação")) {
        elements.push({
            id: generateId(),
            type: "StarRatingField",
            extraAttributes: {
                label: "Avaliação",
                helperText: "Como você avalia?",
                required: true
            }
        })

        elements.push({
            id: generateId(),
            type: "TextArea",
            extraAttributes: {
                label: "Comentários",
                helperText: "Deixe seu comentário",
                required: false,
                placeHolder: "Digite seus comentários...",
                rows: 4
            }
        })
    }

    if (lowerPrompt.includes("cadastro") || lowerPrompt.includes("registro")) {
        elements.push({
            id: generateId(),
            type: "DateField",
            extraAttributes: {
                label: "Data de Nascimento",
                helperText: "Selecione sua data de nascimento",
                required: false
            }
        })
    }

    // Add message/textarea if not already added
    const hasTextArea = elements.some(el => el.type === "TextArea")
    if (!hasTextArea && (lowerPrompt.includes("mensagem") || lowerPrompt.includes("comentário") || lowerPrompt.includes("observação"))) {
        elements.push({
            id: generateId(),
            type: "TextArea",
            extraAttributes: {
                label: "Mensagem",
                helperText: "Digite sua mensagem",
                required: false,
                placeHolder: "Digite aqui...",
                rows: 4
            }
        })
    }

    return elements
}

function extractTitle(prompt: string): string {
    // Simple extraction - take first sentence or first 50 chars
    const sentences = prompt.split(/[.!?]/)
    if (sentences[0]) {
        return sentences[0].trim().slice(0, 50)
    }
    return prompt.slice(0, 50)
}
