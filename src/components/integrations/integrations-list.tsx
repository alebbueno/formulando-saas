"use client"

import { useState } from "react"
import { Integration, IntegrationCard } from "./integration-card"
import { IntegrationSetupSheet } from "./integration-setup-sheet"
import { Webhook, TableProperties, Zap, Slack, Mail, MessageSquare, Code, Globe } from "lucide-react"

const MOCK_INTEGRATIONS: Integration[] = [
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
        id: "webhook",
        title: "Webhook",
        description: "Envie dados para qualquer sistema via requisições HTTP POST instantâneas.",
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
        category: "storage"
    },
    {
        id: "zapier",
        title: "Zapier",
        description: "Conecte o Formulando a mais de 5.000 apps via Zapier.",
        icon: Zap,
        status: "disconnected",
        category: "productivity"
    },
    {
        id: "slack",
        title: "Slack",
        description: "Receba notificações em canais do Slack quando um form for preenchido.",
        icon: Slack,
        status: "connected",
        category: "communication"
    },
    {
        id: "email",
        title: "Email Notifications",
        description: "Receba um email com os dados completos a cada nova resposta.",
        icon: Mail,
        status: "connected",
        category: "communication"
    },
    {
        id: "discord",
        title: "Discord",
        description: "Envie mensagens para servidores do Discord via Webhooks.",
        icon: MessageSquare,
        status: "disconnected",
        category: "communication"
    }
]

export function IntegrationsList() {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleIntegrationClick = (integration: Integration) => {
        setSelectedIntegration(integration)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_INTEGRATIONS.map((integration) => (
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
            />
        </div>
    )
}
