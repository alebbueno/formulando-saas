import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/config/plans"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                const workspaceId = session.metadata?.workspaceId || session.client_reference_id

                if (!workspaceId) break

                // Retrieve the session with line_items to get priceId
                const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                })

                const priceId = fullSession.line_items?.data[0]?.price?.id

                // Find plan by priceId in config
                const planConfig = Object.values(PLANS).find(p => p.priceId === priceId)

                let planId: string | null = null

                if (planConfig) {
                    const { data: plan } = await adminSupabase
                        .from('plans')
                        .select('id')
                        .eq('slug', planConfig.slug)
                        .single()
                    planId = plan?.id
                }

                if (planId) {
                    await adminSupabase
                        .from("workspaces")
                        .update({
                            stripe_customer_id: session.customer as string,
                            subscription_id: session.subscription as string,
                            subscription_status: 'active', // Should verify 'status' from subscription object ideally
                            plan_id: planId
                        })
                        .eq("id", workspaceId)
                }
                break
            }

            case "invoice.payment_succeeded": {
                // Handle recurring payments
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId = (invoice as any).subscription as string
                // Find workspace by subscription_id and update period
                break;
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error)
        return new Response("Webhook processing failed", { status: 500 })
    }

    return new Response(null, { status: 200 })
}
