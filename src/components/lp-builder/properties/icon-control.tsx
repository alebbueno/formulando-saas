"use client"

import * as Icons from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useLPBuilder } from "../context/lp-builder-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Popular icons list
const POPULAR_ICONS = [
    'Star', 'Heart', 'ThumbsUp', 'CheckCircle', 'XCircle',
    'AlertCircle', 'Info', 'Bell', 'Mail', 'Phone',
    'MapPin', 'Calendar', 'Clock', 'Download', 'Upload',
    'Search', 'Settings', 'User', 'Users', 'Home',
    'ShoppingCart', 'CreditCard', 'DollarSign', 'TrendingUp', 'Award',
    'Zap', 'Shield', 'Lock', 'Unlock', 'Eye',
    'PlayCircle', 'PauseCircle', 'StopCircle', 'Volume2', 'Camera',
    'Image', 'File', 'Folder', 'Paperclip', 'Link',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight',
    'Check', 'X', 'Plus', 'Minus', 'Edit'
]

export function IconControl() {
    const { selectedElement, updateElement } = useLPBuilder()
    const [search, setSearch] = useState('')

    if (!selectedElement || selectedElement.type !== 'icon') return null

    const styles = selectedElement.styles || {}
    const iconName = selectedElement.properties?.iconName || 'Star'

    const filteredIcons = POPULAR_ICONS.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    )

    const handleStyleChange = (key: string, value: string) => {
        updateElement(selectedElement.id, {
            styles: { ...styles, [key]: value }
        })
    }

    const handleIconChange = (name: string) => {
        updateElement(selectedElement.id, {
            properties: {
                ...selectedElement.properties,
                iconName: name
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Icon Picker */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Ícone
                </h3>

                <div className="space-y-2">
                    <Input
                        placeholder="Pesquisar ícone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>

                <ScrollArea className="h-48 rounded border">
                    <div className="grid grid-cols-5 gap-2 p-2">
                        {filteredIcons.map((name) => {
                            const IconComponent = Icons[name as keyof typeof Icons] as any
                            const isSelected = iconName === name

                            if (!IconComponent) return null

                            return (
                                <button
                                    key={name}
                                    onClick={() => handleIconChange(name)}
                                    className={cn(
                                        "p-2 rounded hover:bg-accent transition-colors flex items-center justify-center",
                                        isSelected && "bg-primary text-primary-foreground"
                                    )}
                                    title={name}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Style Controls */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Estilos
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Cor do Ícone</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={styles.color || "#000000"}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="w-8 h-8 p-0 border-none cursor-pointer"
                            />
                            <Input
                                value={styles.color || "#000000"}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="h-8 text-xs flex-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Fundo</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={styles.backgroundColor || "transparent"}
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                className="w-8 h-8 p-0 border-none cursor-pointer"
                            />
                            <Input
                                value={styles.backgroundColor || "transparent"}
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                className="h-8 text-xs flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Tamanho do Ícone</Label>
                    <Input
                        placeholder="ex: 24px, 2rem"
                        value={styles.fontSize || ''}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Define o tamanho do ícone (ex: 32px, 3rem)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Padding</Label>
                    <Input
                        placeholder="ex: 10px, 1rem"
                        value={styles.padding || ''}
                        onChange={(e) => handleStyleChange('padding', e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Borda Arredondada</Label>
                    <Input
                        placeholder="ex: 8px, 50%"
                        value={styles.borderRadius || ''}
                        onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                        className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Use 50% para círculo perfeito
                    </p>
                </div>
            </div>
        </div>
    )
}
