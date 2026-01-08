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

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        // Fallback or error if no key
        console.warn("GOOGLE_API_KEY not found. Using partial mock for demonstration purposes if needed, or failing.");
        return { success: false, error: "Configuração de IA ausente no servidor." }
    }

    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
        You are a specialized form generator assistant.
        Your goal is to create a valid JSON structure for a web form based on the user's description.
        
        The Output must be a purely VALID JSON array of objects. Do not include markdown formatting like \`\`\`json \`\`\`.
        
        The available field types are:
        - "TextField": Short text input
        - "TitleField": Section title
        - "ParagraphField": Static text description
        - "SubTitleField": Static subtitle
        - "SeparatorField": horizontal line
        - "SpacerField": vertical space
        - "NumberField": Numeric input
        - "TextArea": Long text input
        - "DateField": Date picker
        - "SelectField": Dropdown menu
        - "CheckboxField": Single checkbox
        - "EmailField": Email validation
        - "PhoneField": text input with phone mask
        - "NameField": text input specialized for names
        - "StarRatingField": Star rating input
        - "ImageUploadField": Image upload (only if requested)

        Each object in the array represents a field and must follow this structure:
        {
          "type": "FieldType",
          "extraAttributes": {
             "label": "Visible Label",
             "helperText": "Small help text below field",
             "required": boolean,
             "placeHolder": "Placeholder text"
          }
        }
        
        For "TitleField", "SubTitleField", "ParagraphField", use the "title" or "text" attribute in extraAttributes instead of label/helperText/required/placeHolder as appropriate for the content.
        For "SelectField", include "options": ["Option 1", "Option 2"] in extraAttributes.

        Rules:
        1. Always start with a "TitleField" summarizing the form purpose.
        2. Always add a "ParagraphField" with a brief description if context allows.
        3. Use "NameField", "EmailField" for contact info.
        4. Be creative but practical and conversion-focused.
        5. Return ONLY the JSON array.
        `;

        const result = await model.generateContent(systemPrompt + "\nUser Request: " + prompt);
        const responseText = result.response.text();

        // Clean up markdown code blocks if the model puts them
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const generatedElements = JSON.parse(cleanedText);

        // Post-process to ensure IDs and valid structure
        const elements: FormElementInstance[] = generatedElements.map((el: any) => ({
            ...el,
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

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

function extractTitle(prompt: string): string {
    // Simple extraction - take first sentence or first 50 chars
    const sentences = prompt.split(/[.!?]/)
    if (sentences[0]) {
        return sentences[0].trim().slice(0, 50)
    }
    return prompt.slice(0, 50)
}
