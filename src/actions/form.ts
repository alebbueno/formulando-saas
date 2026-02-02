"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { FormElementInstance } from "@/context/builder-context"
import { checkLimit } from "@/lib/limits"

export async function getForms() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching forms:", error)
        return []
    }

    return data
}

export async function getFormFields(formId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("projects")
        .select("content")
        .eq("id", formId)
        .single()

    if (error || !data) {
        return []
    }

    try {
        const elements = data.content as FormElementInstance[]
        const fields = elements
            .filter(el => {
                // Return fields that actually hold data (not layout elements)
                const type = el.type
                return !['TitleField', 'ParagraphField', 'SeparatorField', 'SpacerField'].includes(type)
            })
            .map(el => {
                return {
                    id: el.id,
                    label: el.extraAttributes?.label || el.type,
                    type: el.type
                }
            })
        return fields
    } catch (e) {
        console.error("Error parsing fields", e)
        return []
    }
}

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

export async function submitForm(
    formUrl: string,
    content: string,
    utmData?: {
        utm_source: string | null
        utm_medium: string | null
        utm_campaign: string | null
        utm_content: string | null
        utm_term: string | null
        landing_page_url: string | null
        referrer: string | null
    } | null
) {
    // Use Service Role (Admin) to bypass RLS for public submissions
    // Ideally we should have a public insert policy, but for robustness/speed we use Admin here (like leads.ts)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Server configuration error: Missing Service Role Key")
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Validate that the project exists
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, workspace_id")
        .eq("id", formUrl)
        .single()

    if (projectError || !project) {
        throw new Error("Formulário não encontrado")
    }

    // CHECK LEAD LIMIT
    const limitCheck = await checkLimit(project.workspace_id, "leads", supabase)
    if (!limitCheck.allowed) {
        throw new Error(limitCheck.error || "Limite de leads atingido.")
    }

    // Insert into raw submissions table (formerly leads)
    const { data: submission, error } = await supabase
        .from("form_submissions")
        .insert({
            project_id: formUrl,
            data: JSON.parse(content),
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error submitting form:", error)
        throw new Error("Erro ao enviar formulário")
    }

    // Trigger Lead System Processing (Async - don't block response if possible, but safe to await here for now)
    try {
        const { processNewSubmission } = await import("./leads")
        await processNewSubmission(formUrl, JSON.parse(content), submission?.id, utmData)
    } catch (leadError) {
        console.error("Error processing lead system:", leadError)
        // We don't throw here to avoid failing the user submission if just the lead logic fails
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

/**
 * Increment the visit counter for a project (form view tracking)
 * This is called when someone views the form submission page
 */
export async function incrementVisit(projectId: string) {
    // Use Service Role to bypass RLS for public form views
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing Service Role Key for visit tracking")
        return
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Increment visits field directly
    // Fetch current visits first since .raw() is not supported on the client
    const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('visits')
        .eq('id', projectId)
        .single()

    if (fetchError) {
        console.error("Error fetching project visits:", fetchError)
        return
    }

    const { error } = await supabase
        .from('projects')
        .update({ visits: (currentProject?.visits ?? 0) + 1 })
        .eq('id', projectId)

    if (error) {
        console.error("Error incrementing visit:", error)
        // Don't throw - we don't want to block page load if tracking fails
    }
}
