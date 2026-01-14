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

export async function updateFormSettings(id: string, settings: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found")

    const { error } = await supabase
        .from("projects")
        .update({ settings })
        .eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/builder/${id}`)
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

export async function generateFormWithAI(prompt: string, currentForm?: FormElementInstance[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { success: false, error: "Configuração de IA (OpenAI) ausente no servidor." }
    }

    try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey });

        const isEditing = currentForm && currentForm.length > 0;
        let systemPrompt = "";

        const fieldDefinitions = `
        The available field types are (use these EXACT keys):
        - "TextField": Short text input
        - "NumberField": Numeric input
        - "TextArea": Long text input
        - "TitleField": Section title
        - "ParagraphField": Static text description
        - "Checkbox": Checkbox group (requires options)
        - "Select": Dropdown menu (requires options)
        - "RadioGroup": Radio buttons (requires options)
        - "NameField": Full name input
        - "EmailField": Email validation
        - "PhoneField": Phone number mask
        - "UrlField": Website URL
        - "DateField": Date picker
        - "AddressField": Address group (Zip, Street, etc.)
        - "FileField": File upload
        - "StarRatingField": 5-star rating
        - "ToggleField": Yes/No switch
        - "SeparatorField": Horizontal line
        - "SpacerField": Vertical space
        
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
        
        Special attributes:
        - For "TitleField" and "ParagraphField", use "title" or "text" instead of label/placeholder.
        - For "Checkbox", "Select", "RadioGroup", include "options": ["Option 1", "Option 2"] in extraAttributes.
        `;

        if (isEditing) {
            systemPrompt = `
            You are a specialized form editor assistant.
            Your goal is to MODIFY an existing web form based on the user's request.
            
            Current Form Structure (JSON):
            ${JSON.stringify(currentForm)}

            ${fieldDefinitions}

            Rules for EDITING:
            1. Analyze the User Request to understand what needs to change (add, remove, edit, or reorder fields).
            2. Return the COMPLETE, VALID JSON array representing the new state of the form.
            3. Do NOT just return the new fields. Return the WHOLE form with changes applied.
            4. Maintain existing field attributes unless explicitly asked to change them.
            5. If adding new fields, follow the field structure rules strictly.
            6. Return ONLY the JSON array.
            `;
        } else {
            systemPrompt = `
            You are a specialized form generator assistant.
            Your goal is to create a valid JSON structure for a web form based on the user's description.
            
            The Output must be a purely VALID JSON array of objects. Do not include markdown formatting like \`\`\`json \`\`\`.
            
            ${fieldDefinitions}
            
            Rules:
            1. Always start with a "TitleField".
            2. Use "NameField" and "EmailField" for contact forms.
            3. Be concise and conversion-oriented.
            4. Return ONLY the JSON array.
            `;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using a fast, capable model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const responseText = response.choices[0].message.content || "[]";

        // Clean up markdown code blocks if the model puts them
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const generatedElements = JSON.parse(cleanedText);

        // If editing, we try to preserve IDs of existing elements if they are unchanged in the JSON,
        // but the LLM might have messed with them.
        // A simple strategy is: If the LLM returns an ID that exists, keep it. If it's new (or the LLM generated a random one), ensure it's valid.
        // Actually, we should just entrust the LLM to return the IDs if we passed them.
        // But to be safe, let's just make sure every element has an ID.

        const elements: FormElementInstance[] = generatedElements.map((el: any) => ({
            ...el,
            id: el.id || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        return {
            success: true,
            elements,
        }
    } catch (error) {
        console.error("Error generating form with AI:", error)
        return {
            success: false,
            error: "Erro ao gerar formulário com OpenAI. Tente novamente."
        }
    }
}

function extractTitle(prompt: string): string {
    const sentences = prompt.split(/[.!?]/)
    if (sentences[0]) {
        return sentences[0].trim().slice(0, 50)
    }
    return prompt.slice(0, 50)
}

export async function getFormContent(formId: string) {
    const supabase = await createClient()

    console.log(">>> getFormContent: Accessing form:", formId)

    // Public access to fetch form content (needed for public LP pages)
    // We select 'content' and 'settings' to render it properly
    const { data, error } = await supabase
        .from("projects")
        .select("content, settings, is_published")
        .eq("id", formId)

    if (error) {
        console.error(">>> getFormContent: DB Error:", error.message)
        return null
    }

    if (!data || data.length === 0) {
        console.error(">>> getFormContent: No Form Found (Empty Response). Check RLS or ID.")

        // DEBUG: Try with Service Role to see if it exists but is hidden
        // This confirms if it's an RLS issue or if the ID is truly wrong
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createClient } = await import('@supabase/supabase-js')
            const adminSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            )
            const { data: adminData } = await adminSupabase
                .from("projects")
                .select("id, is_published")
                .eq("id", formId)
                .single()

            if (adminData) {
                console.error(`>>> DEBUG ADMIN: Project EXISTS. is_published=${adminData.is_published}. RLS IS BLOCKING IT.`)
            } else {
                console.error(">>> DEBUG ADMIN: Project does NOT exist even for Admin. ID is wrong.")
            }
        }

        return null
    }

    const project = data[0]
    console.log(">>> getFormContent: Found Project. Published?", project.is_published)

    if (!project.is_published) {
        console.warn(">>> getFormContent: Project found but NOT published. RLS might block, but good to know.")
    }

    return project
}

export async function publishProject(id: string, isPublished: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found")

    const { error } = await supabase
        .from("projects")
        .update({ is_published: isPublished })
        .eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/builder/${id}`)
    revalidatePath("/dashboard")
}
