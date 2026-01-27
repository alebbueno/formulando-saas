export const PLANS = {
    free: {
        name: "Free",
        slug: "free",
        productId: "",
        priceId: "",
        price: 0,
        limits: {
            leads: 100,
            emails: 100, // Disparos/mês
            landingPages: 1,
            workspaces: 1,
            forms: 2,
            automations: 1,
            emailTemplates: 2, // Email criados
            whatsapp: false,
            integrations: false
        },
        features: [
            "1 Workspace",
            "2 Formulários",
            "1 Landing Page",
            "100 Leads/mês",
            "1 Automação",
            "100 Disparos de email/mês",
            "WhatsApp não incluído"
        ]
    },
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
            workspaces: 3,
            forms: -1, // Unlimited
            automations: 5,
            emailTemplates: 10,
            whatsapp: true,
            integrations: true
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
            landingPages: -1, // Unlimited
            workspaces: 10,
            forms: -1,
            automations: -1,
            emailTemplates: -1,
            whatsapp: true,
            integrations: true
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
            leads: -1, // Unlimited
            emails: 30000,
            landingPages: -1, // Unlimited
            workspaces: -1, // Unlimited
            forms: -1,
            automations: -1,
            emailTemplates: -1,
            whatsapp: true,
            integrations: true
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
