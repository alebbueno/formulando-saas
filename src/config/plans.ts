export const PLANS = {
    growth: {
        name: "Growth",
        slug: "growth",
        productId: "prod_TnwGaQKBmEWv4z",
        priceId: "price_1SqKNc2c9gUP7wyGDg8QMB2T",
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
        productId: "prod_TnwGOC1SFq1RwT",
        priceId: "price_1SqKNd2c9gUP7wyGJU7PWPrD",
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
        productId: "prod_TnwGt7rJWD5V4I",
        priceId: "price_1SqKNe2c9gUP7wyGPSZHlkU6",
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
