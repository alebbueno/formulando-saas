export const PLANS = {
    growth: {
        name: "Growth",
        slug: "growth",
        productId: "prod_ToVlNePzn3Xsji",
        priceId: "price_1SqsjdD0Hr6fCA3PENcsas80",
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
        productId: "prod_ToVlB9EyxNhZoR",
        priceId: "price_1SqsjeD0Hr6fCA3P7M82nWf5",
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
        productId: "prod_ToVl5614cAJVUJ",
        priceId: "price_1SqsjfD0Hr6fCA3P4Qep9xvt",
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
