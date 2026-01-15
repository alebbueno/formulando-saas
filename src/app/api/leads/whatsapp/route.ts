import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with Service Role Key
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const body = await req.json();
        const { workspace_id, data: leadData } = body;

        if (!workspace_id || !leadData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch WhatsApp Config to get Phone Number & Template
        const { data: config, error: configError } = await supabase
            .from('whatsapp_configs')
            .select('phone_number, message_template')
            .eq('workspace_id', workspace_id)
            .single()

        if (configError || !config) {
            return NextResponse.json({ error: 'WhatsApp config not found' }, { status: 404 });
        }

        // 2. Create Lead
        const { email, name, phone, ...extraFields } = leadData;

        // Normalize
        const normalizedEmail = email?.toLowerCase().trim();

        // Lead Data
        const leadInsert = {
            workspace_id,
            email: normalizedEmail,
            name: name || null,
            phone: phone || null,
            source_type: 'whatsapp',
            custom_fields: {
                ...extraFields,
                widget_source: 'whatsapp_button'
            },
            // optional: determine status based on potential rules?
        };

        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert(leadInsert)
            .select('id')
            .single();

        if (leadError) {
            console.error('Error inserting lead:', leadError);
            return NextResponse.json({ error: 'Failed to capture lead' }, { status: 500 });
        }

        // 3. Construct WhatsApp URL
        // Replace variables in template? e.g. {{name}}
        let message = config.message_template || '';
        if (name) message = message.replace('{{name}}', name);
        if (email) message = message.replace('{{email}}', email);

        const encodedMessage = encodeURIComponent(message);
        // Clean phone number (remove non-digits)
        const cleanPhone = config.phone_number.replace(/\D/g, '');

        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

        // Return URL for client to redirect
        return NextResponse.json({
            success: true,
            lead_id: lead.id,
            redirect_url: whatsappUrl
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
