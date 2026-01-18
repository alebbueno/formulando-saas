/**
 * Script para sincronizar assinaturas do Stripe com o banco de dados
 * Use este script quando um pagamento foi processado mas o plano não foi atualizado
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Load env vars
try {
    process.loadEnvFile('.env.local')
} catch (e) {
    // ignore
}

const stripeKey = process.env.STRIPE_SECRET_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables")
    process.exit(1)
}

const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
})

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Plan mapping
const PLANS = {
    growth: {
        slug: "growth",
        priceId: "price_1SqsjdD0Hr6fCA3PENcsas80",
    },
    scale: {
        slug: "scale",
        priceId: "price_1SqsjeD0Hr6fCA3P7M82nWf5",
    },
    agency_pro: {
        slug: "agency-pro",
        priceId: "price_1SqsjfD0Hr6fCA3P4Qep9xvt",
    }
}

async function syncSubscription(subscriptionId: string) {
    console.log(`\n🔄 Syncing subscription: ${subscriptionId}`)

    try {
        // 1. Get subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        console.log(`   Status: ${subscription.status}`)
        console.log(`   Customer: ${subscription.customer}`)

        const workspaceId = subscription.metadata?.workspaceId
        if (!workspaceId) {
            console.error("   ❌ No workspaceId in subscription metadata")
            return
        }

        console.log(`   Workspace ID: ${workspaceId}`)

        // 2. Get price ID
        const priceId = subscription.items.data[0]?.price.id
        console.log(`   Price ID: ${priceId}`)

        // 3. Find plan by priceId
        const planConfig = Object.values(PLANS).find(p => p.priceId === priceId)

        if (!planConfig) {
            console.error(`   ❌ No plan found for priceId: ${priceId}`)
            return
        }

        console.log(`   Plan: ${planConfig.slug}`)

        // 4. Get plan ID from database
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('slug', planConfig.slug)
            .single()

        if (planError || !plan) {
            console.error("   ❌ Error fetching plan from DB:", planError)
            return
        }

        console.log(`   Plan DB ID: ${plan.id}`)

        // 5. Update workspace
        // Handle current_period_end which might be null for trialing subscriptions
        const periodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : (subscription as any).trial_end
                ? new Date((subscription as any).trial_end * 1000).toISOString()
                : null

        const { error: updateError } = await supabase
            .from('workspaces')
            .update({
                stripe_customer_id: subscription.customer as string,
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                plan_id: plan.id,
                ...(periodEnd && { current_period_end: periodEnd })
            })
            .eq('id', workspaceId)

        if (updateError) {
            console.error("   ❌ Error updating workspace:", updateError)
        } else {
            console.log("   ✅ Workspace updated successfully!")
        }

    } catch (error) {
        console.error("   ❌ Error:", error)
    }
}

async function syncAllActiveSubscriptions() {
    console.log("🚀 Syncing all active subscriptions from Stripe...\n")

    const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 100
    })

    console.log(`Found ${subscriptions.data.length} active subscriptions\n`)

    for (const sub of subscriptions.data) {
        await syncSubscription(sub.id)
    }

    console.log("\n✅ Sync complete!")
}

// Main
const args = process.argv.slice(2)

if (args.length === 0) {
    console.log("Usage:")
    console.log("  npm run sync-stripe              # Sync all active subscriptions")
    console.log("  npm run sync-stripe sub_xxx      # Sync specific subscription")
    process.exit(0)
}

if (args[0] === 'all' || args.length === 0) {
    syncAllActiveSubscriptions()
} else {
    syncSubscription(args[0])
}
