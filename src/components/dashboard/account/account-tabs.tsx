"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountOverview } from "@/components/dashboard/account/account-overview"
import { AccountFinancial } from "./account-financial"
import { AccountUsers } from "./account-users"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { Users, CreditCard, Settings, LayoutGrid } from "lucide-react"

interface AccountTabsProps {
    user: User
}

export function AccountTabs({ user }: AccountTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview" className="flex gap-2">
                    <LayoutGrid className="w-4 h-4" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value="users" className="flex gap-2">
                    <Users className="w-4 h-4" /> Usuários
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex gap-2">
                    <CreditCard className="w-4 h-4" /> Financeiro
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex gap-2">
                    <Settings className="w-4 h-4" /> Configurações
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <AccountOverview />
            </TabsContent>

            <TabsContent value="users" className="space-y-4 pt-4">
                <AccountUsers />
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
                <AccountFinancial />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Settings className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Configurações Gerais</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                        Gerencie as configurações da sua conta, segurança e preferências de notificação.
                    </p>
                    <Button variant="outline" disabled>Em desenvolvimento</Button>
                </div>
            </TabsContent>
        </Tabs>
    )
}
