import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { sendAutomationEmail } from "@/actions/send-automation-email";

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/process-emails
 * Periodically check scheduled emails in email_logs and send them
 */
export async function GET(request: Request) {
    // Check for authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = createAdminClient();

        // 1. Fetch scheduled emails that are due
        const { data: pendingLogs, error: fetchError } = await supabase
            .from("email_logs")
            .select("id, workspace_id, template_id, lead_id, recipient_email")
            .eq("status", "scheduled")
            .lte("scheduled_for", new Date().toISOString())
            .limit(100); // Process in batches of 100 (matches daily limit normally)

        if (fetchError) throw fetchError;

        if (!pendingLogs || pendingLogs.length === 0) {
            return NextResponse.json({ message: "No scheduled emails to process." });
        }

        const results = [];

        // 2. Process each email
        for (const log of pendingLogs) {
            try {
                if (!log.lead_id || !log.template_id || !log.workspace_id) {
                    await supabase
                        .from("email_logs")
                        .update({ status: "failed", error_message: "Missing required references", sent_at: new Date().toISOString() })
                        .eq("id", log.id);
                    continue;
                }

                // Fetch the lead data required by sendAutomationEmail
                const { data: lead } = await supabase
                    .from("leads")
                    .select("*")
                    .eq("id", log.lead_id)
                    .single();

                if (!lead) {
                    await supabase
                        .from("email_logs")
                        .update({ status: "failed", error_message: "Lead not found", sent_at: new Date().toISOString() })
                        .eq("id", log.id);
                    continue;
                }

                // Send the email and update the log via existingLogId
                const res = await sendAutomationEmail(
                    log.template_id,
                    lead,
                    log.workspace_id,
                    undefined,
                    { existingLogId: log.id }
                );

                results.push({ log_id: log.id, success: res.success, error: (res as any).error });
            } catch (innerError) {
                console.error(`Error processing scheduled email log ${log.id}:`, innerError);
                await supabase
                        .from("email_logs")
                        .update({ status: "failed", error_message: innerError instanceof Error ? innerError.message : String(innerError), sent_at: new Date().toISOString() })
                        .eq("id", log.id);
            }
        }

        return NextResponse.json({ 
            message: `Processed ${pendingLogs.length} scheduled emails.`,
            results 
        });
    } catch (error) {
        console.error("Cron Error process-emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
