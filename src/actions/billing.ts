"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCustomerPortalSession(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("id, stripe_customer_id")
        .eq("id", workspaceId)
        .eq("owner_id", user.id)
        .single()

    if (!workspace || !workspace.stripe_customer_id) {
        throw new Error("Workspace not found or no subscription active")
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: workspace.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })

    return session.url
}

export async function getBillingHistory(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Verify ownership
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("id, stripe_customer_id")
        .eq("id", workspaceId)
        .eq("owner_id", user.id)
        .single()

    if (!workspace || !workspace.stripe_customer_id) {
        return []
    }

    const invoices = await stripe.invoices.list({
        customer: workspace.stripe_customer_id,
        limit: 10,
    })

    return invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        date: new Date(invoice.created * 1000).toLocaleDateString("pt-BR"),
        amount: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(invoice.amount_paid / 100),
        status: invoice.status,
        pdf: invoice.invoice_pdf,
    }))
}

export async function getWorkspaceUsage(workspaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { leads: 0, emails: 0 }

    // Start of current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Count leads
    // We assume 'leads' table has 'workspace_id' and 'created_at'
    const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .gte('created_at', firstDay)

    if (error) {
        console.error("Error fetching usage:", error)
        return { leads: 0, emails: 0 }
    }

    // Email usage is currently not tracked in DB, returning mock or 0
    // If we have an 'emails_sent' table log, we would query it similarly.
    // For now, let's assume 0 or random for demo? Best to return 0 until implemented.
    const emailsCount = 0

    return {
        leads: count || 0,
        emails: emailsCount
    }
}
