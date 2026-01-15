import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder"

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Using placeholder to prevent crash.")
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
})
