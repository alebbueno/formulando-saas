
import { createClient } from "@/lib/supabase/server"
import { AccountTabs } from "../../../components/dashboard/account/account-tabs"
import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"

import Image from "next/image"
import Link from "next/link"

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
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-8 h-8 flex items-center justify-center transition-all group-hover:scale-110">
                            <img
                                src="/icon-formulando.svg"
                                alt="Formulando"
                                className="w-full h-full"
                            />
                        </div>
                        <span className="text-lg font-bold hidden sm:block font-brand" style={{ color: '#8831d2' }}>
                            formulando.
                        </span>
                    </Link>
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
