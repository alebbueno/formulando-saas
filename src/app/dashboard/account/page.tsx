
import { createClient } from "@/lib/supabase/server"
import { AccountTabs } from "../../../components/dashboard/account/account-tabs"
import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"

import Image from "next/image"

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Image
                        src="/icon-formulando.png"
                        alt="Formulando Logo"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                    <span className="text-2xl font-bold font-[family-name:var(--font-be-vietnam)] text-[#8831d2]">Formulando</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Minha Conta</h2>
                    <p className="text-muted-foreground">
                        Gerencie seus workspaces, configurações de perfil e preferências.
                    </p>
                </div>
            </div>
            <Separator className="my-6" />
            <AccountTabs user={user} />
        </div>
    )
}
