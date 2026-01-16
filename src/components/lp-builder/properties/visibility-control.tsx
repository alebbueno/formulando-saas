"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Monitor, Smartphone } from "lucide-react"
import { useLPBuilder } from "../context/lp-builder-context"

export function VisibilityControl() {
    const { selectedElement, updateElement } = useLPBuilder()

    if (!selectedElement) return null

    const visibility = selectedElement.properties?.visibility || {
        desktop: true,
        mobile: true
    }

    const handleVisibilityChange = (device: 'desktop' | 'mobile', visible: boolean) => {
        updateElement(selectedElement.id, {
            properties: {
                ...selectedElement.properties,
                visibility: {
                    ...visibility,
                    [device]: visible
                }
            }
        })
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Visibilidade
            </h3>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-xs cursor-pointer">Desktop</Label>
                    </div>
                    <Switch
                        checked={visibility.desktop !== false}
                        onCheckedChange={(checked) => handleVisibilityChange('desktop', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-xs cursor-pointer">Mobile</Label>
                    </div>
                    <Switch
                        checked={visibility.mobile !== false}
                        onCheckedChange={(checked) => handleVisibilityChange('mobile', checked)}
                    />
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
                Controle quando o elemento deve aparecer em diferentes dispositivos
            </p>
        </div>
    )
}
