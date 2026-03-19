import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, data } = body

        console.log(`[ResendWebhook] Received event: ${type}`, data.email_id)

        if (!data.email_id) {
            return NextResponse.json({ error: "Missing email_id" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Map Resend events to our status tracking
        let newStatus = ""
        let errorMessage = null

        switch (type) {
            case "email.sent":
                newStatus = "sent"
                break
            case "email.delivered":
                newStatus = "delivered"
                break
            case "email.opened":
                newStatus = "opened"
                break
            case "email.clicked":
                newStatus = "clicked"
                break
            case "email.bounced":
                newStatus = "failed"
                errorMessage = "Bounced (Devolvido)"
                break
            case "email.complained":
                newStatus = "failed"
                errorMessage = "Complained (Spam)"
                break
            default:
                console.log(`[ResendWebhook] Unhandled event type: ${type}`)
                return NextResponse.json({ message: "Event ignored" })
        }

        if (newStatus) {
            // First, get the current log to find workspace_id and lead_id
            const { data: log, error: fetchError } = await supabase
                .from("email_logs")
                .select("workspace_id, lead_id, template_id")
                .eq("resend_id", data.email_id)
                .single()

            if (fetchError || !log) {
                console.error(`[ResendWebhook] Log not found for ${data.email_id}:`, fetchError)
                return NextResponse.json({ error: "Log not found" }, { status: 404 })
            }

            // Update status
            const { error: updateError } = await supabase
                .from("email_logs")
                .update({ 
                    status: newStatus,
                    error_message: errorMessage || undefined
                })
                .eq("resend_id", data.email_id)

            if (updateError) {
                console.error(`[ResendWebhook] Failed to update log for ${data.email_id}:`, updateError)
                return NextResponse.json({ error: "Update failed" }, { status: 500 })
            }

            console.log(`[ResendWebhook] Updated ${data.email_id} to status: ${newStatus}`)

            // Trigger Email Automations for Open/Click
            if (newStatus === 'opened' || newStatus === 'clicked') {
                const { triggerEmailAutomations } = await import("@/lib/automation-engine")
                // Use a standard event name for the trigger matching
                const eventType = newStatus === 'opened' ? 'email_opened' : 'email_clicked'
                
                await triggerEmailAutomations(
                    log.workspace_id, 
                    log.lead_id, 
                    eventType, 
                    log.template_id
                )
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[ResendWebhook] Error processing webhook:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
