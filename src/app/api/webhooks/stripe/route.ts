import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/config/plans"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    console.log("🔔 [Stripe Webhook] Received event")

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
        console.log(`✅ [Stripe Webhook] Event verified: ${event.type}`)
    } catch (error: any) {
        console.error("❌ [Stripe Webhook] Signature verification failed:", error.message)
        return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                console.log("💳 [Stripe Webhook] Processing checkout.session.completed")
                const session = event.data.object as Stripe.Checkout.Session
                const workspaceId = session.metadata?.workspaceId || session.client_reference_id

                console.log(`   Workspace ID: ${workspaceId}`)
                console.log(`   Customer ID: ${session.customer}`)
                console.log(`   Subscription ID: ${session.subscription}`)

                if (!workspaceId) {
                    console.error("❌ [Stripe Webhook] No workspaceId found in session metadata")
                    break
                }

                // Retrieve the session with line_items to get priceId
                const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                })

                const priceId = fullSession.line_items?.data[0]?.price?.id
                console.log(`   Price ID: ${priceId}`)

                // Find plan by priceId in config
                const planConfig = Object.values(PLANS).find(p => p.priceId === priceId)

                if (!planConfig) {
                    console.error(`❌ [Stripe Webhook] No plan found for priceId: ${priceId}`)
                    console.log("   Available plans:", Object.values(PLANS).map(p => ({ slug: p.slug, priceId: p.priceId })))
                    break
                }

                console.log(`   Plan found: ${planConfig.name} (${planConfig.slug})`)

                let planId: string | null = null

                const { data: plan, error: planError } = await adminSupabase
                    .from('plans')
                    .select('id')
                    .eq('slug', planConfig.slug)
                    .single()

                if (planError) {
                    console.error("❌ [Stripe Webhook] Error fetching plan from DB:", planError)
                    break
                }

                planId = plan?.id

                if (planId) {
                    console.log(`   Updating workspace ${workspaceId} with plan ${planId}`)

                    // Get subscription details to save current_period_end
                    let currentPeriodEnd: string | null = null
                    if (session.subscription) {
                        try {
                            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
                            currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString()
                            console.log(`   Current period end: ${currentPeriodEnd}`)
                        } catch (error) {
                            console.error("⚠️  [Stripe Webhook] Could not retrieve subscription details:", error)
                        }
                    }

                    const { error: updateError } = await adminSupabase
                        .from("workspaces")
                        .update({
                            stripe_customer_id: session.customer as string,
                            subscription_id: session.subscription as string,
                            subscription_status: 'active',
                            plan_id: planId,
                            current_period_end: currentPeriodEnd
                        })
                        .eq("id", workspaceId)

                    if (updateError) {
                        console.error("❌ [Stripe Webhook] Error updating workspace:", updateError)
                    } else {
                        console.log("✅ [Stripe Webhook] Workspace updated successfully")
                    }
                } else {
                    console.error("❌ [Stripe Webhook] Plan ID not found in database")
                }
                break
            }

            case "invoice.payment_succeeded": {
                console.log("💰 [Stripe Webhook] Processing invoice.payment_succeeded")
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId = (invoice as any).subscription as string
                console.log(`   Subscription ID: ${subscriptionId}`)
                // Find workspace by subscription_id and update period
                break;
            }

            default:
                console.log(`ℹ️  [Stripe Webhook] Unhandled event type: ${event.type}`)
        }
    } catch (error) {
        console.error("❌ [Stripe Webhook] Processing error:", error)
        return new Response("Webhook processing failed", { status: 500 })
    }

    return new Response(null, { status: 200 })
}
