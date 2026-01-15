
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// We use the anon key because the 'leads' table has RLS policies that allow public inserts.
// If we needed to bypass RLS, we'd use the service role key, but strict RLS is better.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    // Handle CORS
    // Note: In Next.js App Router, handling CORS in a single route can be tricky if Middleware is strict,
    // but returning headers usually works for simple cases.
    const origin = req.headers.get('origin');

    // Basic validation
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders(origin) });
    }

    const { workspace_id, email, name, phone, page_url, source, ...extraFields } = body;

    // Validate required fields
    if (!workspace_id || !email) {
        return NextResponse.json(
            { error: 'Missing required fields: workspace_id and email are required.' },
            { status: 400, headers: corsHeaders(origin) }
        );
    }

    // Normalize email
    const normalizedEmail = email.toString().toLowerCase().trim();

    try {
        // Insert lead
        const { data, error } = await supabase
            .from('leads')
            .insert({
                workspace_id,
                email: normalizedEmail,
                name: name || null,
                phone: phone || null,
                page_url: page_url || null,
                source_type: source || 'legacy_form', // Map to source_type
                // project_id removed as it doesn't exist
                // metadata handled if column exists? The schema has 'ai_analysis' and 'custom_fields'. 
                // Let's put metadata in custom_fields for now if no specific column, 
                // OR check if metadata column exists (it wasn't in the CREATE TABLE dump, but usually standard).
                // The dump showed: id, workspace_id, name, email, company, job_title, source_type, source_id, score, status, tags, created_at, updated_at, custom_fields, score_reason, notes, ai_analysis.
                // NO metadata column. So we put specific metadata in custom_fields or ignore.
                // Let's merge metadata into custom_fields.
                custom_fields: {
                    ...extraFields,
                    metadata: {
                        user_agent: req.headers.get('user-agent'),
                        ip: req.headers.get('x-forwarded-for') || 'unknown',
                        referer: req.headers.get('referer'),
                    }
                }
            })
            .select() // Select to confirm insertion if needed
            .single();

        if (error) {
            console.error('Error inserting lead:', error);
            return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
        }

        return NextResponse.json({ success: true, lead_id: data.id }, { status: 200, headers: corsHeaders(origin) });

    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders(origin) });
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
}

function corsHeaders(origin: string | null) {
    return {
        'Access-Control-Allow-Origin': '*', // Allow any origin for maximum compatibility with legacy sites
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    };
}
