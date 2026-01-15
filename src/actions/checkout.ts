"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
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
