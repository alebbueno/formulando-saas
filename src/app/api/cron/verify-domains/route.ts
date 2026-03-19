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

        // 1. Fetch pending domains
        const { data: pendingDomains, error: fetchError } = await supabase
            .from("domains")
            .select("id, resend_domain_id, domain")
            .eq("status", "pending")
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

                // Trigger verification
                await resend.domains.verify(domain.resend_domain_id);

                // Get status
                const { data: resendDomain } = await resend.domains.get(domain.resend_domain_id);

                if (resendDomain) {
                    const isVerified = resendDomain.status === "verified";
                    
                    await supabase
                        .from("domains")
                        .update({
                            status: resendDomain.status,
                            dns_records: resendDomain.records,
                            verified_at: isVerified ? new Date().toISOString() : null,
                        })
                        .eq("id", domain.id);
                    
                    results.push({ domain: domain.domain, status: resendDomain.status });
                }
            } catch (innerError) {
                console.error(`Error verifying domain ${domain.domain}:`, innerError);
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
