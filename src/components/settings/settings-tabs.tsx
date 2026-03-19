"use client"


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "./general-settings"
import { BillingSettings } from "./billing-settings"
import { CollaboratorsList } from "./collaborators-list"

import { ProfileSettings } from "./profile-settings"
import { DomainSettings } from "./domain-settings"
import { useWorkspace } from "@/context/workspace-context"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function SettingsTabs() {
    const { activeWorkspace } = useWorkspace()
    const role = activeWorkspace?.role || "member"

    const showProfile = role === "client" || role === "finance_client"
    const showBilling = role === "owner" || role === "finance_client"
    const showUsers = role === "owner" || role === "member" // Assuming members can see user list? Or restricted? User request: "Aba Usuarios lista somente os usuarios clientes..." implies view access.
    // The user request says: "Aba Usuarios lista somente os usuarios clientes vinculados a esse workspace com os cargos"
    // It doesn't explicitly restrict ACCESS to the tab, but defines CONTENT.
    // However, usually "owner" manages users. Let's assume Owner/Member can see Users tab, and we filter content inside.

    // If I look closely at the request "Aba de perfil: so aparece se o usuario foi do tipo cliente ou cliente financeiro"
    // "Aba geral...". "Aba Usuarios...". "Aba Financeiro..."

    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const [selectedTab, setSelectedTab] = useState(tabParam || (showProfile ? "profile" : "general"))

    useEffect(() => {
        if (tabParam) {
            setSelectedTab(tabParam)
        }
    }, [tabParam])

    return (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
            <div className="border-b border-border/40 pb-px">
                <TabsList className="h-auto p-0 bg-transparent gap-6">
                    {showProfile && (
                        <TabsTrigger
                            value="profile"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                        >
                            Perfil
                        </TabsTrigger>
                    )}

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

                    {showBilling && (
                        <TabsTrigger
                            value="billing"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                        >
                            Financeiro
                        </TabsTrigger>
                    )}
                    
                    {role === "owner" && (
                        <TabsTrigger
                            value="domains"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground/80 transition-colors"
                        >
                            Domínios
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            {showProfile && (
                <TabsContent value="profile" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ProfileSettings />
                </TabsContent>
            )}

            <TabsContent value="general" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <GeneralSettings />
            </TabsContent>

            <TabsContent value="users" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CollaboratorsList />
            </TabsContent>

            {showBilling && (
                <TabsContent value="billing" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <BillingSettings />
                </TabsContent>
            )}

            {role === "owner" && (
                <TabsContent value="domains" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <DomainSettings />
                </TabsContent>
            )}
        </Tabs>
    )
}
