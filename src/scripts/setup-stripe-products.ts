
import Stripe from 'stripe'


// Load env vars
try {
    process.loadEnvFile('.env.local')
} catch (e) {
    // ignore if file doesn't exist, might be in env already
}

const stripeKey = process.env.STRIPE_SECRET_KEY

if (!stripeKey) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment variables.")
    process.exit(1)
}

if (stripeKey.startsWith('sk_test_')) {
    console.warn("⚠️  WARNING: You are using a TEST mode key. Products will be created in Test mode.")
} else {
    console.log("✅ Using LIVE mode key.")
}

const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-01-27.acacia' as any, // using latest or matching project version
})

const PLANS = [
    {
        name: "Growth",
        slug: "growth",
        price: 24900, // in cents
        features: ["Até 5.000 leads", "2.000 emails/mês"]
    },
    {
        name: "Scale",
        slug: "scale",
        price: 54900, // in cents
        features: ["Até 25.000 leads", "10.000 emails/mês"]
    },
    {
        name: "Agency Pro",
        slug: "agency-pro",
        price: 89900, // in cents
        features: ["Leads ilimitados", "30.000 emails/mês"]
    }
]

// Define type for results
type PlanResult = { productId: string, priceId: string }

async function main() {
    console.log("🚀 Starting Stripe Product Setup...")

    const results: Record<string, PlanResult> = {}

    for (const plan of PLANS) {
        console.log(`\nCreating product: ${plan.name}...`)

        try {
            // 1. Create Product
            const product = await stripe.products.create({
                name: plan.name,
                metadata: {
                    slug: plan.slug
                }
            })
            console.log(`  ✅ Product created: ${product.id}`)

            // 2. Create Price
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: plan.price,
                currency: 'brl',
                recurring: {
                    interval: 'month'
                },
                metadata: {
                    slug: plan.slug
                }
            })
            console.log(`  ✅ Price created: ${price.id}`)

            results[plan.slug] = {
                productId: product.id,
                priceId: price.id
            }

        } catch (error) {
            console.error(`  ❌ Error creating ${plan.name}:`, error)
        }
    }

    console.log("\n\n🎉 Setup Complete! Here are your IDs for src/config/plans.ts:\n")

    console.log("export const PLANS = {")
    Object.entries(results).forEach(([slug, ids]: [string, any]) => {
        console.log(`    ${slug.replace('-', '_')}: {`)
        console.log(`        // ... other props`)
        console.log(`        productId: "${ids.productId}",`)
        console.log(`        priceId: "${ids.priceId}",`)
        console.log(`    },`)
    })
    console.log("}")
}

main()
