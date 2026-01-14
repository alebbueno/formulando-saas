
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Label } from "@radix-ui/react-label"

interface GeneralSettingsProps {
    settings: any
    onSettingsChange: (key: string, value: any) => void
}

export function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
    return (
        <div className="space-y-6 py-4">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Básico</h3>
                <div className="grid gap-2">
                    <Label htmlFor="seo-title">Título da Página (SEO)</Label>
                    <Input
                        id="seo-title"
                        placeholder="Ex: Formulando - Crie formulários incríveis"
                        value={settings?.seoTitle || ""}
                        onChange={(e) => onSettingsChange("seoTitle", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Aparece na aba do navegador e nos resultados do Google.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="seo-desc">Descrição (Meta Description)</Label>
                    <Textarea
                        id="seo-desc"
                        placeholder="Breve descrição da sua página..."
                        className="h-20 resize-none"
                        value={settings?.seoDescription || ""}
                        onChange={(e) => onSettingsChange("seoDescription", e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Favicon</Label>
                    <ImageUpload
                        value={settings?.favicon || ""}
                        onChange={(url) => onSettingsChange("favicon", url)}
                        accept="image/png, image/x-icon, image/vnd.microsoft.icon"
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Analytics & Scripts</h3>

                <div className="grid gap-2">
                    <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                    <Input
                        id="fb-pixel"
                        placeholder="Ex: 1234567890"
                        value={settings?.facebookPixelId || ""}
                        onChange={(e) => onSettingsChange("facebookPixelId", e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="google-id">Google Analytics / GTM ID</Label>
                    <Input
                        id="google-id"
                        placeholder="Ex: G-XXXXXXXXXX ou GTM-XXXXXX"
                        value={settings?.googleAnalyticsId || ""}
                        onChange={(e) => onSettingsChange("googleAnalyticsId", e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="custom-head">Scripts no &lt;head&gt;</Label>
                    <Textarea
                        id="custom-head"
                        placeholder="<script>...</script>"
                        className="h-32 font-mono text-xs"
                        value={settings?.customHeadScripts || ""}
                        onChange={(e) => onSettingsChange("customHeadScripts", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Cuidado! Scripts mal formatados podem quebrar sua página.
                    </p>
                </div>
            </div>
        </div>
    )
}
