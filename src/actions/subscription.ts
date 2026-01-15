"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS, PlanType } from "@/config/plans"
import { redirect } from "next/navigation"
import { createCheckoutSession } from "./checkout"

export async function checkTrialEligibility() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Heuristic: If user has ANY workspace, they are not eligible for a new trial (simplified 1 trial per account)
    // Or stricter: Check if they ever had a trial. 
    // For now: If count > 0, false.
    const { count } = await supabase
        .from('workspaces')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)

    return count === 0
}

export async function createWorkspaceWithCheckout(data: {
    name: string
    slug: string
    planSlug: string
    useTrial: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // 1. Validate Slug
    const { data: existing } = await supabase
        .from("workspaces")
        .select("id")
        .eq("slug", data.slug)
        .single()

    if (existing) {
        return { error: "Este identificador já está em uso." }
    }

    // 2. Validate Trial Eligibility
    if (data.useTrial) {
        const isEligible = await checkTrialEligibility()
        if (!isEligible) {
            return { error: "Você já utilizou seu período de trial." }
        }
    }

    // 3. Create Workspace (Incomplete/Trialing state)
    // We create it immediately so we have an ID to attach to the Subscription
    const planConfig = Object.values(PLANS).find(p => p.slug === data.planSlug)
    if (!planConfig) return { error: "Plano inválido" }

    // Fetch plan_id from DB
    const { data: planDb } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', data.planSlug)
        .single()

    if (!planDb) return { error: "Erro de configuração do plano." }

    const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
            name: data.name,
            slug: data.slug,
            owner_id: user.id,
            plan_id: planDb.id,
            subscription_status: data.useTrial ? 'trialing' : 'incomplete',
            // If trial, we set 'trialing' BUT we still need Stripe to confirm.
            // Actually, safest is 'incomplete' until Stripe webhook fires, 
            // BUT for instant "Start Trial" UX with no card, we might want to skip Stripe?
            // "Billing (Stripe) -> Implementação obrigatória -> 1 subscription por workspace -> Stripe Checkout"
            // So even trial needs Stripe Checkout (Card required usually, or checkout session with trial).
        })
        .select("id")
        .single()

    if (wsError) {
        console.error(wsError)
        return { error: "Erro ao criar workspace." }
    }

    // 4. Create Stripe Checkout Session
    // We need to pass the workspaceId so the webhook can fulfill it.
    try {
        const checkoutUrl = await createCheckoutSession(
            planConfig.priceId,
            workspace.id,
            data.useTrial ? 7 : 0 // 7 days trial if requested
        )

        if (!checkoutUrl) {
            return { error: "Erro ao conectar com o pagamento." }
        }

        return { success: true, checkoutUrl, workspaceId: workspace.id }

    } catch (err) {
        console.error("Checkout Error:", err)
        // Rollback workspace creation? Ideally yes, but hard with Supabase simple client.
        // admin delete...
        const admin = createAdminClient()
        await admin.from('workspaces').delete().eq('id', workspace.id)

        return { error: "Falha ao iniciar checkout." }
    }
}
