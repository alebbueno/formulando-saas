
import { createClient } from "@/lib/supabase/server"
import { AccountTabs } from "../../../components/dashboard/account/account-tabs"
import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Minha Conta</h2>
                <p className="text-muted-foreground">
                    Gerencie seus workspaces, configurações de perfil e preferências.
                </p>
            </div>
            <Separator className="my-6" />
            <AccountTabs user={user} />
        </div>
    )
}
