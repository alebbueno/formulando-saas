"use server"

import { createClient } from "@/lib/supabase/server"

interface LeadData {
    name?: string
    email?: string
    company?: string
    job_title?: string
    [key: string]: any
}

// Helper to find key efficiently case-insensitive
function findValue(data: any, keys: string[]): string | undefined {
    const dataKeys = Object.keys(data)
    for (const key of keys) {
        const foundKey = dataKeys.find(k => k.toLowerCase() === key.toLowerCase())
        if (foundKey) return data[foundKey]
    }
    return undefined
}



function calculateLeadScore(data: {
    email?: string,
    company?: string,
    jobTitle?: string,
    submissionData: any
}): { score: number, reason: string, tags: string[] } {
    let score = 0
    let reasons: string[] = []
    let tags: string[] = []

    // 1. Corporate Email (+10)
    if (data.email) {
        const freeProviders = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'uol.com.br', 'bol.com.br', 'icloud.com']
        const domain = data.email.split('@')[1]
        if (domain && !freeProviders.includes(domain.toLowerCase())) {
            score += 10
            reasons.push("Email corporativo")
        }
    }

    // 2. Company filled (+10)
    if (data.company && data.company.trim().length > 1) {
        score += 10
        reasons.push("Empresa informada")
    }

    // 3. Job Title filled (+10)
    if (data.jobTitle && data.jobTitle.trim().length > 1) {
        score += 10
        reasons.push("Cargo informado")
    }

    // 4. Job Decision Keywords (+20)
    if (data.jobTitle) {
        const decisionKeywords = ['ceo', 'founder', 'fundador', 'diretor', 'director', 'gerente', 'manager', 'head', 'vp', 'presidente', 'sócio', 'socio', 'owner']
        if (decisionKeywords.some(k => data.jobTitle!.toLowerCase().includes(k))) {
            score += 20
            reasons.push("Cargo de decisão")
            tags.push("decisor")
        }
    }

    // 5. Budget filled (+20)
    const budget = findValue(data.submissionData, ['budget', 'orçamento', 'orcamento', 'verba', 'investimento'])
    if (budget) {
        // Simple check: if not empty and excludes "sem orçamento" or similar low intent
        const lowIntent = ['não tenho', 'sem', 'zero', 'nda', 'n/a']
        if (!lowIntent.some(exclude => budget.toLowerCase().includes(exclude))) {
            score += 20
            reasons.push("Orçamento informado")
        } else {
            tags.push("sem-orcamento")
        }
    }

    // 6. Urgency (+30)
    const urgency = findValue(data.submissionData, ['urgency', 'urgência', 'urgencia', 'prazo', 'timeline'])
    if (urgency) {
        const highUrgencyKeywords = ['imediato', 'agora', 'em breve', 'plm', 'asap', 'this week', 'essa semana', 'ontem']
        if (highUrgencyKeywords.some(k => urgency.toLowerCase().includes(k))) {
            score += 30
            reasons.push("Urgência alta")
        }
    }

    // Cap at 100
    if (score > 100) score = 100

    // Auto Tags based on score
    if (score >= 70) {
        tags.push("alto-interesse")
    } else if (score < 30) {
        tags.push("baixo-interesse")
    }

    return {
        score,
        reason: reasons.length > 0 ? `Este lead recebeu ${score} pontos por: ${reasons.join(", ")}.` : "Score base inicial.",
        tags
    }
}

export async function processNewSubmission(projectId: string, submissionData: any, submissionId?: string) {
    console.log(`>>> processNewSubmission: START for Project ${projectId}, Submission ${submissionId}`)

    // We MUST use the Admin Client (Service Role) for the entire process.
    // The public user (or preview access) likely does not have RLS permission to read `workspace_id` from `projects`.
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error(">>> processNewSubmission: Missing SUPABASE_SERVICE_ROLE_KEY")
        return
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Get Project to find Workspace AND Form Definition for robust field mapping
    const { data: project, error: projectError } = await adminSupabase
        .from("projects")
        .select("workspace_id, content")
        .eq("id", projectId)
        .single()

    if (projectError || !project) {
        console.error(">>> processNewSubmission: Error finding project (Admin):", projectError)
        return
    }

    const workspaceId = project.workspace_id

    if (!workspaceId) {
        console.error(">>> processNewSubmission: ERROR - Project has no workspace_id. Cannot create lead.")
        return
    }

    // 2. Extract Standard Fields using Form Definition (Schema)
    // We prioritize the schema to find which field corresponds to 'EmailField', 'NameField', etc.
    let email: string | undefined
    let name: string | undefined
    let company: string | undefined
    let jobTitle: string | undefined

    if (project.content && Array.isArray(project.content)) {
        const formContent = project.content as any[]

        // Find fields by Type
        const emailField = formContent.find(el => el.type === "EmailField")
        const nameField = formContent.find(el => el.type === "NameField")
        const companyField = formContent.find(el =>
        // We don't have a specific CompanyField, so we look for text fields with specific labels or fieldName
        (el.type === "TextField" && (
            el.extraAttributes?.fieldName === "company" ||
            el.extraAttributes?.fieldName === "empresa" ||
            el.extraAttributes?.label?.toLowerCase().includes("empresa") ||
            el.extraAttributes?.label?.toLowerCase().includes("company")
        ))
        )
        const jobField = formContent.find(el =>
        (el.type === "TextField" && (
            el.extraAttributes?.fieldName === "job" ||
            el.extraAttributes?.fieldName === "cargo" ||
            el.extraAttributes?.label?.toLowerCase().includes("cargo") ||
            el.extraAttributes?.label?.toLowerCase().includes("job")
        ))
        )

        // Helper to get value using ID or fieldName
        const getValue = (field: any) => {
            if (!field) return undefined
            // Try fieldName first
            if (field.extraAttributes?.fieldName && submissionData[field.extraAttributes.fieldName]) {
                return submissionData[field.extraAttributes.fieldName]
            }
            // Try ID
            if (submissionData[field.id]) {
                return submissionData[field.id]
            }
            return undefined
        }

        email = getValue(emailField)
        name = getValue(nameField)
        company = getValue(companyField)
        jobTitle = getValue(jobField)
    }

    // Fallback to fuzzy matching if schema didn't yield results (or if content is empty/legacy)
    if (!email) email = findValue(submissionData, ['email', 'e-mail', 'mail'])
    if (!name) name = findValue(submissionData, ['name', 'nome', 'full name', 'nome completo'])
    if (!company) company = findValue(submissionData, ['company', 'empresa', 'organization'])
    if (!jobTitle) jobTitle = findValue(submissionData, ['job', 'cargo', 'job title', 'job_title'])

    // console.log(`>>> processNewSubmission: Extracted Data - Email: ${email}, Name: ${name}, Company: ${company}, Job: ${jobTitle}`)

    let leadId: string | null = null

    // 3. Check if Lead Exists (by Email + Workspace)
    if (email) {
        // We need to query `leads` table. 
        // Public users can't SELECT leads usually. 
        // We SHOULD use Service Role here to verify existence without exposing data to client.
        // BUT, since we are in a Server Action, we are on the server.
        // The `supabase` client here is creating using `createClient` which uses `cookies` (user session).
        // If the user is unauthenticated (public form submitter), they have NO access to read leads.
        // SOLUTION: We MUST use Service Role (Admin) for this strictly backend logic.



        const { data: existingLead, error } = await adminSupabase
            .from("leads")
            .select("id, score")
            .eq("workspace_id", workspaceId)
            .eq("email", email)
            .single()

        if (error) {
            // It's normal to have an error if no row is found (PGRST116), but let's log other errors
            if (error.code !== 'PGRST116') {
                console.error(">>> processNewSubmission: Error checking existing lead:", error)
            }
        }

        if (existingLead) {
            leadId = existingLead.id
            // Update Lead? Maybe update name if missing, or score?
            // For now, just log event.
        } else {
            // Extract standard fields
            const standardFields = ['email', 'name', 'company', 'job', 'job title', 'job_title', 'e-mail']
            const customFields: Record<string, any> = {}

            Object.keys(submissionData).forEach(key => {
                if (!standardFields.some(sf => sf === key.toLowerCase() || key.toLowerCase().includes(sf))) {
                    // It's likely a custom field or something else.
                    // We should only exclude very specific mapped keys.
                    // Actually, let's keep it simple: any key that wasn't used for the main columns.
                    // But `findValue` checks multiple keys.
                    // Let's filter out the specific keys we found.
                    // This is complex because we don't know exactly which key matched.
                    // Simplified approach: Store EVERYTHING else in custom_fields.
                    customFields[key] = submissionData[key]
                }
            })

            // Calculate Score
            const { score, reason, tags } = calculateLeadScore({
                email,
                company,
                jobTitle,
                submissionData
            })

            // Create New Lead
            const { data: newLead, error: createError } = await adminSupabase
                .from("leads")
                .insert({
                    workspace_id: workspaceId,
                    name: name || 'Sem nome', // Fallback
                    email: email,
                    company: company,
                    job_title: jobTitle,
                    source_type: 'form',
                    source_id: projectId,
                    score: score,
                    score_reason: reason,
                    status: score >= 60 ? 'Qualificado' : 'Novo Lead',
                    tags: tags,
                    custom_fields: customFields
                })
                .select("id")
                .single()

            if (createError) {
                console.error("Error creating lead:", createError)
                return
            }
            leadId = newLead.id

            // Log Score Event
            await adminSupabase
                .from("lead_events")
                .insert({
                    lead_id: leadId,
                    type: 'score_calculated',
                    payload: {
                        score,
                        reason,
                        tags
                    }
                })
        }

        // 4. Log Event
        if (leadId) {
            await adminSupabase
                .from("lead_events")
                .insert({
                    lead_id: leadId,
                    type: 'form_submit',
                    payload: {
                        form_id: projectId,
                        data: submissionData
                    }
                })


            // Wait, if I do it inline, I can just log the event with the score I used.
            // But 'leadId' is available. 'score', 'reason' are available if new.
            // If existing, we didn't recalc.
            // Let's stick to the prompt's request for "creation".

            // Refactoring payload slightly to be valid TS if possible or just simplified.
            // Actually, I need to pass the score values to this scope if I want to log them accurately.
            // But wait, the 'score' variable is only available in the 'else' block (new lead).
            // If it's an existing lead, we didn't calculate.
            // So I should move the event logging INSIDE the 'else' block or refactor.

            // 5. Link Submission to Lead (if submissionId provided)
            if (submissionId) {
                await adminSupabase
                    .from("form_submissions")
                    .update({ lead_id: leadId })
                    .eq("id", submissionId)
            }

            // 6. Execute Automations
            try {
                // Fetch active automations for this workspace
                const { data: automations } = await adminSupabase
                    .from("automations")
                    .select("*")
                    .eq("workspace_id", workspaceId) // Use workspaceId from scope
                    .eq("is_active", true)
                    .eq("trigger_type", "form_submission")

                if (automations && automations.length > 0) {
                    const { executeAutomation } = await import("@/lib/automation-engine")

                    for (const auto of automations) {
                        // Check trigger config
                        // If config.formId is present, it must match. If missing, maybe run for all forms in workspace?
                        // For safety, let's require formId match if present.
                        const config = auto.trigger_config as any
                        if (config?.formId && config.formId !== projectId) {
                            continue
                        }

                        // Execute (awaiting to ensure it runs in serverless environment)
                        await executeAutomation(auto.id, {
                            leadId: leadId,
                            workspaceId: workspaceId,
                            projectId: projectId,
                            triggerData: submissionData
                        })
                    }
                }
            } catch (autoError) {
                console.error("Error executing automations:", autoError)
                // Don't fail the submission if automation fails
            }
        }
    } else {
        // No email? We could create an anonymous lead or skip.
        // For MVP, if no email, we treat it as just a raw submission (which is already saved in `form_submissions`).
        // Optionally creating a lead without email is tricky for deduplication.
        console.log("Skipping Lead creation: No email found in submission.")
    }
}

export type Lead = {
    id: string
    name: string
    email: string
    phone?: string | null
    company: string | null
    job_title: string | null
    score: number
    score_reason?: string
    status: string
    tags: string[]
    custom_fields?: Record<string, any>
    notes?: string
    ai_analysis?: {
        score_final?: number
        score_adjustment_reason?: string
        lead_temperature?: 'frio' | 'morno' | 'quente'
        tags?: string[]
        marketing_summary?: string
        // Keep legacy fields for backward compatibility if needed, or migration
        adjusted_score?: number
        explanation?: string
        suggested_tags?: string[]
    }
    created_at: string
}

export async function getLeads(opts: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    workspaceId: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const page = opts.page || 1
    const pageSize = opts.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("workspace_id", opts.workspaceId)
        .order("created_at", { ascending: false })
        .range(from, to)

    if (opts.search) {
        query = query.or(`name.ilike.%${opts.search}%,email.ilike.%${opts.search}%,company.ilike.%${opts.search}%`)
    }

    if (opts.status) {
        query = query.eq("status", opts.status)
    }

    const { data, count, error } = await query

    if (error) {
        console.error("Error fetching leads:", error)
        return { leads: [], total: 0, totalPages: 0 }
    }

    return {
        leads: data as Lead[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
    }
}

export type LeadEvent = {
    id: string
    type: string
    payload: any
    created_at: string
}

export async function getLead(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching lead:", error)
        return null
    }

    return data as Lead
}

export async function getLeadEvents(leadId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { data, error } = await supabase
        .from("lead_events")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching lead events:", JSON.stringify(error, null, 2))
        return []
    }

    return data as LeadEvent[]
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    // Get current status for logging
    const { data: currentLead, error: fetchError } = await supabase
        .from("leads")
        .select("status")
        .eq("id", leadId)
        .single()

    if (fetchError || !currentLead) {
        throw new Error("Lead não encontrado")
    }

    const oldStatus = currentLead.status

    if (oldStatus === newStatus) return

    const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId)

    if (error) {
        throw new Error(error.message)
    }

    // Log Event
    await supabase
        .from("lead_events")
        .insert({
            lead_id: leadId,
            type: 'status_changed',
            payload: {
                old_status: oldStatus,
                new_status: newStatus,
                changed_by: user.id
            }
        })
}

export async function updateLeadNotes(leadId: string, notes: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { error } = await supabase
        .from("leads")
        .update({ notes: notes })
        .eq("id", leadId)

    if (error) {
        console.error("Error updating notes:", error)
        throw new Error("Erro ao salvar notas")
    }
}

export async function analyzeLeadWithAI(leadId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Configuração de IA (OpenAI) ausente no servidor.");
    }

    // Fetch Lead Data with Events/Submissions
    const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single()

    if (error || !lead) {
        throw new Error("Lead não encontrado")
    }

    // We also want the form submission data if possible to give more context
    const { data: events } = await supabase
        .from("lead_events")
        .select("*")
        .eq("lead_id", leadId)
        .eq("type", "form_submit")
        .limit(1)
        .single()

    // Construct Prompt
    const submissionData = events?.payload?.data || lead.custom_fields || {};
    const promptData = {
        name: lead.name,
        email: lead.email,
        company: lead.company,
        job_title: lead.job_title,
        score: lead.score,
        notes: lead.notes,
        submission: submissionData
    };

    try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey });
        const { LEAD_ANALYSIS_SYSTEM_PROMPT, LEAD_ANALYSIS_USER_PROMPT_TEMPLATE } = await import("@/lib/ai-prompts");

        // Construct User Prompt
        const userPrompt = LEAD_ANALYSIS_USER_PROMPT_TEMPLATE({
            name: lead.name,
            email: lead.email,
            company: lead.company,
            job_title: lead.job_title,
            source_id: lead.source_id,
            submission: submissionData,
            score: lead.score
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: LEAD_ANALYSIS_SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        const analysis = JSON.parse(content);

        // Update Lead with AI Analysis
        await supabase
            .from("leads")
            .update({ ai_analysis: analysis })
            .eq("id", leadId)

        // Log Event
        await supabase
            .from("lead_events")
            .insert({
                lead_id: leadId,
                type: 'ai_analysis',
                payload: analysis
            })

        return { success: true, analysis }

    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Erro ao analisar lead com IA");
    }
}

export async function updateLeadScore(leadId: string, newScore: number, reason?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Usuário não autenticado")

    const { error } = await supabase
        .from("leads")
        .update({ score: newScore, score_reason: reason })
        .eq("id", leadId)

    if (error) throw new Error("Erro ao atualizar score")

    await supabase.from("lead_events").insert({
        lead_id: leadId,
        type: 'score_manual_update',
        payload: { new_score: newScore, reason, updated_by: user.id }
    })
}

export async function addLeadTags(leadId: string, newTags: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Usuário não autenticado")

    // First get existing tags
    const { data: lead } = await supabase
        .from("leads")
        .select("tags")
        .eq("id", leadId)
        .single()

    if (!lead) throw new Error("Lead não encontrado")

    const currentTags = (lead.tags as string[]) || []
    // Merge unique tags
    const updatedTags = Array.from(new Set([...currentTags, ...newTags]))

    const { error } = await supabase
        .from("leads")
        .update({ tags: updatedTags })
        .eq("id", leadId)

    if (error) throw new Error("Erro ao atualizar tags")

    await supabase.from("lead_events").insert({
        lead_id: leadId,
        type: 'tags_added',
        payload: { added_tags: newTags, updated_by: user.id }
    })
}

export async function getLeadStats(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Usuário não autenticado")

    // Get all leads (RLS filters by user/workspace)
    const { data: leads, error } = await supabase
        .from("leads")
        .select("id, status, score, name, company, email, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching lead stats:", error)
        return {
            total: 0,
            qualified: 0,
            byStatus: [],
            hotLeads: []
        }
    }

    const total = leads.length
    const qualified = leads.filter(l => l.score >= 60 || l.status === 'Qualificado').length

    // Group by status
    const statusCounts: Record<string, number> = {}
    leads.forEach(l => {
        const s = l.status || "Novo Lead"
        statusCounts[s] = (statusCounts[s] || 0) + 1
    })
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

    // Hot Leads (Score >= 70)
    const hotLeads = leads
        .filter(l => l.score >= 70)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    return {
        total,
        qualified,
        byStatus,
        hotLeads
    }
}
