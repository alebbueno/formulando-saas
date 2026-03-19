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
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[ResendWebhook] Error processing webhook:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
