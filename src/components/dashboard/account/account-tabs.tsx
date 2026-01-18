"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountOverview } from "@/components/dashboard/account/account-overview"

import { AccountUsers } from "./account-users"
import { AccountSettings } from "./account-settings"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { Users, Settings, LayoutGrid } from "lucide-react"

interface AccountTabsProps {
    user: User
}

export function AccountTabs({ user }: AccountTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                    value="overview"
                    className="flex gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-none"
                >
                    <LayoutGrid className="w-4 h-4" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger
                    value="users"
                    className="flex gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-none"
                >
                    <Users className="w-4 h-4" /> Usuários
                </TabsTrigger>

                <TabsTrigger
                    value="settings"
                    className="flex gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-none"
                >
                    <Settings className="w-4 h-4" /> Configurações
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <AccountOverview />
            </TabsContent>

            <TabsContent value="users" className="space-y-4 pt-4">
                <AccountUsers />
            </TabsContent>



            <TabsContent value="settings" className="space-y-4 pt-4">
                <AccountSettings
                    userEmail={user.email}
                    userName={user.user_metadata?.full_name || user.user_metadata?.name || null}
                    userAvatar={user.user_metadata?.avatar_url || null}
                />
            </TabsContent>
        </Tabs>
    )
}
