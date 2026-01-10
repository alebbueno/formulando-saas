import { Separator } from "@/components/ui/separator"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie suas preferências de conta e configurações do workspace.
                </p>
            </div>

            <Separator />

            <SettingsTabs />
        </div>
    )
}
