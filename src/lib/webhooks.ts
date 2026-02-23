import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Initialize Admin Supabase Client
const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type WebhookPayload = {
    event: string
    [key: string]: any
}

export async function dispatchWebhooks(workspaceId: string, payload: WebhookPayload) {
    try {
        console.log(`[Webhooks] Finding active webhooks for workspace ${workspaceId}`)

        const { data: webhooks, error } = await adminSupabase
            .from("webhooks")
            .select("id, url, secret, events")
            .eq("workspace_id", workspaceId)
            .eq("is_active", true)

        if (error || !webhooks || webhooks.length === 0) {
            console.log(`[Webhooks] No active webhooks found.`)
            return
        }

        const promises = webhooks.map(async (webhook) => {
            // Check if webhook is subscribed to this event
            if (webhook.events && Array.isArray(webhook.events)) {
                if (!webhook.events.includes(payload.event) && !webhook.events.includes("*")) {
                    return // Skip if not subscribed
                }
            }

            console.log(`[Webhooks] Dispatching to ${webhook.url}`)

            const payloadAsString = JSON.stringify({
                id: crypto.randomUUID(), // Unique event ID
                created_at: new Date().toISOString(),
                ...payload
            })

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "User-Agent": "Formulando-Webhook/1.0"
            }

            // Generate signature if secret exists
            if (webhook.secret) {
                const signature = crypto
                    .createHmac("sha256", webhook.secret)
                    .update(payloadAsString)
                    .digest("hex")
                headers["X-Formulando-Signature"] = signature
            }

            try {
                // Fetch is async and won't block if we don't await the result here,
                // but we map it into promises.
                const response = await fetch(webhook.url, {
                    method: "POST",
                    headers,
                    body: payloadAsString,
                    // Short timeout to prevent hanging the main request if webhook is slow (optional, depends on environment)
                    signal: AbortSignal.timeout(5000)
                })

                if (!response.ok) {
                    console.error(`[Webhooks] Webhook to ${webhook.url} failed with status: ${response.status}`)
                } else {
                    console.log(`[Webhooks] Successfully dispatched to ${webhook.url}`)
                }

                // Note: In a production scale system, we would log these executions into an `automation_executions` or `webhook_logs` table.

            } catch (fetchError) {
                console.error(`[Webhooks] Failed to reach ${webhook.url}:`, fetchError)
            }
        })

        // Fire and forget (or await if you want to ensure they start before serverless function exits)
        // Since Vercel/Next.js might kill the process, we use Promise.allSettled to at least initiate the fetch
        await Promise.allSettled(promises)

    } catch (e) {
        console.error(`[Webhooks] Error in dispatch module:`, e)
    }
}
