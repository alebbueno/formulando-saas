import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase with Service Role Key to allow public fetch of config by workspace_id
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspace_id')

    if (!workspaceId) {
        return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // Fetch config
    const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('phone_number, message_template, is_active, position, button_color, button_text, button_icon, fields_config')
        .eq('workspace_id', workspaceId)
        .single()

    if (error) {
        // If not found, return default or 404? 
        // Better return a default config so the widget handles it freely or shows nothing
        if (error.code === 'PGRST116') {
            // Not found -> Return Inactive
            return NextResponse.json({ is_active: false }, { status: 200 })
        }
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
    }

    // CORS headers for public access
    return NextResponse.json(data, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}
