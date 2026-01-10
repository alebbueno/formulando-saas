"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "./general-settings"
import { BillingSettings } from "./billing-settings"
import { CollaboratorsList } from "./collaborators-list"

import { ProfileSettings } from "./profile-settings"

export function SettingsTabs() {
    return (
        <Tabs defaultValue="profile" className="space-y-8">
            <div className="border-b border-border/40 pb-px">
                <TabsList className="h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="profile"
                        className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                    >
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger
                        value="general"
                        className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                    >
                        Geral
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                    >
                        Usuários
                    </TabsTrigger>
                    <TabsTrigger
                        value="billing"
                        className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                    >
                        Financeiro
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ProfileSettings />
            </TabsContent>

            <TabsContent value="general" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <GeneralSettings />
            </TabsContent>

            <TabsContent value="users" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CollaboratorsList />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BillingSettings />
            </TabsContent>
        </Tabs>
    )
}
