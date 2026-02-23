import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Admin Supabase Client
const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        // 1. Authenticate Token
        const authHeader = req.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized. Missing Bearer token." }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]

        // Check if token exists and is valid
        const { data: apiToken, error: tokenError } = await adminSupabase
            .from("api_tokens")
            .select("workspace_id, id")
            .eq("token", token)
            .single()

        if (tokenError || !apiToken) {
            return NextResponse.json({ error: "Invalid API token." }, { status: 401 })
        }

        const workspaceId = apiToken.workspace_id

        // 2. Parse Request Body
        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
        }

        const { name, email, phone, company, job_title, status, ...customFields } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required field." }, { status: 400 })
        }

        // 3. Simple Scoring (We can use a basic scoring or import the existing one if we adapt it)
        // For simplicity we do a basic calculation here, or we can abstract it.
        let score = 0
        let tags: string[] = ["api"]
        let reasons: string[] = []

        if (email) {
            const freeProviders = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'uol.com.br', 'bol.com.br', 'icloud.com']
            const domain = email.split('@')[1]
            if (domain && !freeProviders.includes(domain.toLowerCase())) {
                score += 10
                reasons.push("Email corporativo")
            }
        }
        if (company && company.trim().length > 1) {
            score += 10
            reasons.push("Empresa informada")
        }
        if (job_title && job_title.trim().length > 1) {
            score += 10
            reasons.push("Cargo informado")
            const decisionKeywords = ['ceo', 'founder', 'fundador', 'diretor', 'director', 'gerente', 'manager', 'head', 'vp', 'presidente', 'sócio', 'socio', 'owner']
            if (decisionKeywords.some(k => job_title.toLowerCase().includes(k))) {
                score += 20
                reasons.push("Cargo de decisão")
                tags.push("decisor")
            }
        }

        if (score >= 40) {
            tags.push("alto-interesse")
        } else if (score < 20) {
            tags.push("baixo-interesse")
        }

        // 4. Update Last Used At
        await adminSupabase
            .from("api_tokens")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", apiToken.id)


        // 5. Check if lead exists to avoid duplicates
        const { data: existingLead } = await adminSupabase
            .from("leads")
            .select("id")
            .eq("workspace_id", workspaceId)
            .eq("email", email)
            .single()

        let leadId = existingLead?.id

        if (!leadId) {
            // Insert new lead
            const { data: newLead, error: insertError } = await adminSupabase
                .from("leads")
                .insert({
                    workspace_id: workspaceId,
                    name: name || 'Sem nome',
                    email: email,
                    phone: phone,
                    company: company,
                    job_title: job_title,
                    source_type: 'api',
                    score: score,
                    score_reason: reasons.length > 0 ? `Este lead recebeu ${score} pontos por: ${reasons.join(", ")}.` : "Score base inicial.",
                    status: status || (score >= 30 ? 'Qualificado' : 'Novo Lead'),
                    tags: tags,
                    custom_fields: customFields
                })
                .select("id")
                .single()

            if (insertError) {
                console.error("[API v1 Leads] Error inserting lead:", insertError)
                return NextResponse.json({ error: "Failed to create lead." }, { status: 500 })
            }

            leadId = newLead.id

            await adminSupabase
                .from("lead_events")
                .insert({
                    lead_id: leadId,
                    type: 'lead_created_api',
                    payload: { body }
                })
        } else {
            // Update existing lead custom fields or notes could be done here if desired
            await adminSupabase
                .from("lead_events")
                .insert({
                    lead_id: leadId,
                    type: 'api_update_received',
                    payload: { body }
                })
        }

        // 6. Trigger Webhooks (Create this file next)
        const { dispatchWebhooks } = await import("@/lib/webhooks")
        await dispatchWebhooks(workspaceId, {
            event: "lead.created",
            lead: {
                id: leadId,
                name,
                email,
                phone,
                company,
                job_title,
                status,
                score,
                tags,
                custom_fields: customFields
            }
        })


        return NextResponse.json({ success: true, lead_id: leadId }, { status: 201 })

    } catch (error) {
        console.error("[API v1 Leads] Unhandled error:", error)
        return NextResponse.json({ error: "Internal server error." }, { status: 500 })
    }
}
