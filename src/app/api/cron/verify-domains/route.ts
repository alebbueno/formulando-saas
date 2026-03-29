import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/verify-domains
 * Periodically check pending domains in Resend
 */
export async function GET(request: Request) {
    // Check for authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = createAdminClient();

        // 1. Fetch domains that are not yet verified
        const { data: pendingDomains, error: fetchError } = await supabase
            .from("domains")
            .select("id, resend_domain_id, domain")
            .neq("status", "verified")
            .limit(20); // Process in batches

        if (fetchError) throw fetchError;

        if (!pendingDomains || pendingDomains.length === 0) {
            return NextResponse.json({ message: "No pending domains to verify." });
        }

        const results = [];

        // 2. Iterate and verify
        for (const domain of pendingDomains) {
            try {
                if (!domain.resend_domain_id) continue;

                console.log(`[Cron] Checking domain: ${domain.domain}`);

                // Trigger verification
                try {
                    await resend.domains.verify(domain.resend_domain_id);
                } catch (vErr) {
                    console.warn(`[Cron] Verify trigger warning for ${domain.domain}:`, vErr);
                }

                // Get status
                const { data: resendDomain, error: getErr } = await resend.domains.get(domain.resend_domain_id);

                if (getErr) {
                    console.error(`[Cron] Error getting domain ${domain.domain}:`, getErr);
                    continue;
                }

                if (resendDomain) {
                    const currentStatus = (resendDomain.status || "pending").toLowerCase();
                    const isVerified = currentStatus === "verified";
                    
                    console.log(`[Cron] Domain ${domain.domain} status: ${currentStatus}`);

                    await supabase
                        .from("domains")
                        .update({
                            status: currentStatus,
                            dns_records: resendDomain.records,
                            verified_at: isVerified ? new Date().toISOString() : null, // Reset if lost verification
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", domain.id);
                    
                    results.push({ domain: domain.domain, status: currentStatus });
                }
            } catch (innerError) {
                console.error(`[Cron] Unexpected error for domain ${domain.domain}:`, innerError);
            }
        }

        return NextResponse.json({ 
            message: `Processed ${pendingDomains.length} domains.`,
            results 
        });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
