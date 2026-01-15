export const PLANS = {
    growth: {
        name: "Growth",
        slug: "growth",
        productId: "prod_TnUveTAWrd3vMA",
        priceId: "price_1Sptw3KCwACzC5XnBy67qfWS",
        price: 249,
        limits: {
            leads: 5000,
            emails: 2000,
            landingPages: 10,
            workspaces: 3
        },
        features: [
            "Até 5.000 leads",
            "2.000 emails/mês",
            "Até 10 landing pages",
            "Formulários ilimitados",
            "Funil de vendas completo",
            "Automações e Webhooks"
        ]
    },
    scale: {
        name: "Scale",
        slug: "scale",
        productId: "prod_TnUvnNywl8KSo0",
        priceId: "price_1SptwHKCwACzC5XnQFMJ9901",
        price: 549,
        limits: {
            leads: 25000,
            emails: 10000,
            landingPages: 999999, // Unlimited
            workspaces: 10
        },
        features: [
            "Até 25.000 leads",
            "10.000 emails/mês",
            "Landing pages ilimitadas",
            "Automações ilimitadas",
            "IA avançada",
            "White-label parcial"
        ]
    },
    agency_pro: {
        name: "Agency Pro",
        slug: "agency-pro",
        productId: "prod_TnUw4hvnE4xKdf",
        priceId: "price_1SptwUKCwACzC5XnH3ZOzYDR",
        price: 899,
        limits: {
            leads: 999999, // Unlimited
            emails: 30000,
            landingPages: 999999, // Unlimited
            workspaces: 999999 // Unlimited
        },
        features: [
            "Leads ilimitados",
            "30.000 emails/mês",
            "White-label completo",
            "Multi-domínio",
            "IA estendida",
            "Suporte prioritário"
        ]
    }
}

export type PlanType = keyof typeof PLANS
