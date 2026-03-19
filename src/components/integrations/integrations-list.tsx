"use client"

import { useState } from "react"
import { Integration, IntegrationCard } from "./integration-card"
import { IntegrationSetupSheet } from "./integration-setup-sheet"
import { Webhook, TableProperties, Zap, Slack, Mail, MessageSquare, Code, Globe, Send } from "lucide-react"

const MOCK_INTEGRATIONS: Integration[] = [
    {
        id: "resend",
        title: "Resend (Email)",
        description: "Conecte seu próprio domínio para enviar e-mails personalizados e profissionais.",
        icon: Send,
        status: "connected",
        category: "communication"
    },
    {
        id: "legacy-forms",
        title: "Formulários Existentes", // Legacy Forms
        description: "Capture leads de qualquer site ou formulário HTML existente apenas adicionando um script.",
        icon: Code,
        status: "connected",
        category: "communication"
    },
    {
        id: "wordpress",
        title: "WordPress",
        description: "Plugin oficial para integrar seus formulários diretamente no admin do WP.",
        icon: Globe, // Using Globe as placeholder, ideally custom SVG
        status: "disconnected",
        category: "cms"
    },
    {
        id: "api",
        title: "Tokens de API",
        description: "Gere tokens para enviar leads de outras plataformas e sistemas para o Formulando.",
        icon: Code,
        status: "disconnected",
        category: "communication"
    },
    {
        id: "webhook",
        title: "Webhooks",
        description: "Envie os novos leads instantaneamente para Zapier, Make ou sistemas próprios via POST.",
        icon: Webhook,
        status: "disconnected",
        category: "communication"
    },
    {
        id: "google-sheets",
        title: "Google Sheets",
        description: "Adicione novas linhas automaticamente em sua planilha a cada envio.",
        icon: TableProperties,
        status: "beta",
        category: "storage",
        comingSoon: true
    },
    {
        id: "zapier",
        title: "Zapier",
        description: "Conecte o Formulando a mais de 5.000 apps via Zapier.",
        icon: Zap,
        status: "disconnected",
        category: "productivity",
        comingSoon: true
    },
    {
        id: "slack",
        title: "Slack",
        description: "Receba notificações em canais do Slack quando um form for preenchido.",
        icon: Slack,
        status: "connected",
        category: "communication",
        comingSoon: true
    },
    {
        id: "email",
        title: "Email Notifications",
        description: "Receba um email com os dados completos a cada nova resposta.",
        icon: Mail,
        status: "connected",
        category: "communication",
        comingSoon: true
    },
    {
        id: "discord",
        title: "Discord",
        description: "Envie mensagens para servidores do Discord via Webhooks.",
        icon: MessageSquare,
        status: "disconnected",
        category: "communication",
        comingSoon: true
    }
]

export function IntegrationsList({
    workspaceId,
    apiTokens,
    webhooks,
    domains = []
}: {
    workspaceId: string,
    apiTokens: any[],
    webhooks: any[],
    domains: any[]
}) {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Dynamically update Resend status
    const integrations = MOCK_INTEGRATIONS.map(integration => {
        if (integration.id === 'resend') {
            const hasVerified = domains.some(d => d.status === 'verified')
            const hasDomain = domains.length > 0
            
            return {
                ...integration,
                status: hasVerified ? "connected" : hasDomain ? "disconnected" : "disconnected"
                // If it has a domain but not verified, it's technically disconnected from sending custom emails
            } as Integration
        }
        return integration
    })

    const handleIntegrationClick = (integration: Integration) => {
        setSelectedIntegration(integration)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                    <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onClick={() => handleIntegrationClick(integration)}
                    />
                ))}
            </div>

            <IntegrationSetupSheet
                integration={selectedIntegration}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                workspaceId={workspaceId}
                apiTokens={apiTokens}
                webhooks={webhooks}
            />
        </div>
    )
}
