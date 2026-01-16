"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

// Helper function to ensure URL has proper scheme
function getBaseUrl(): string {
    // If NEXT_PUBLIC_APP_URL is set and valid, use it
    if (process.env.NEXT_PUBLIC_APP_URL) {
        const url = process.env.NEXT_PUBLIC_APP_URL
        // If it already has a scheme, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        // Otherwise, add https:// prefix
        return `https://${url}`
    }

    // In production on Vercel, use VERCEL_URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    // Fallback to localhost for development
    return 'http://localhost:3000'
}

export async function createCheckoutSession(priceId: string, workspaceId: string, trialDays: number = 0) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    // Verify ownership
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("id, stripe_customer_id, name")
        .eq("id", workspaceId)
        .eq("owner_id", user.id)
        .single()

    if (!workspace) {
        console.error(`[createCheckoutSession] Workspace not found. ID: ${workspaceId}, User: ${user.id}`)
        throw new Error("Workspace não encontrado ou sem permissão")
    }

    let customerId = workspace.stripe_customer_id

    // Create customer if not exists
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email!,
            name: workspace.name,
            metadata: {
                workspaceId: workspaceId,
                userId: user.id
            }
        })
        customerId = customer.id
        // Note: We are not saving customerId to DB here to save time/complexity in this action, 
        // but the webhook handles the sync when checkout completes.
    }

    const baseUrl = getBaseUrl()

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        subscription_data: {
            trial_period_days: trialDays > 0 ? trialDays : undefined,
            metadata: {
                workspaceId: workspaceId
            }
        },
        success_url: `${baseUrl}/dashboard?success=true`,
        cancel_url: `${baseUrl}/dashboard?canceled=true`,
        metadata: {
            workspaceId: workspaceId,
        },
        client_reference_id: workspaceId
    })

    if (!session.url) {
        throw new Error("Erro ao criar sessão de checkout")
    }

    return session.url
}
