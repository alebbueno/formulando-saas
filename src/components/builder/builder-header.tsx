import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Save, Settings, ArrowLeft, Monitor, Smartphone, Tablet, ChevronDown, Check, Globe } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BuilderHeaderProps {
    onSave: () => void
    onPreview: () => void
    projectName: string
    onProjectNameChange: (name: string) => void
    isPublished: boolean
    onPublishToggle: (checked: boolean) => void
    isSaving?: boolean
}

import { SettingsModal } from "./settings-modal"
import { ShareModal } from "./share-modal"

// ... existing imports

export function BuilderHeader({
    onSave,
    onPreview,
    projectName,
    onProjectNameChange,
    isPublished,
    onPublishToggle,
    isSaving
}: BuilderHeaderProps) {
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

    return (
        <nav className="flex justify-between border-b border-muted p-3 gap-4 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-16">

            {/* Left: Branding & Name */}
            <div className="flex items-center gap-3 w-[300px]">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full hover:bg-muted">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </Link>

                <div className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <Input
                            className="bg-transparent border-0 text-sm font-semibold p-0 h-auto focus-visible:ring-0 px-1 truncate w-[180px] shadow-none hover:bg-muted/30 rounded-sm transition-colors"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                        />
                        <span className="text-[10px] text-muted-foreground px-1">Espaço de Trabalho</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
            </div>



            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-[300px] justify-end">

                <div className="flex items-center gap-2 mr-2 border-r pr-4 h-6">
                    <Switch
                        id="publish-mode"
                        checked={isPublished}
                        onCheckedChange={onPublishToggle}
                        className={cn(
                            "data-[state=checked]:bg-green-500"
                        )}
                    />
                    <Label htmlFor="publish-mode" className="text-xs font-medium cursor-pointer flex items-center gap-1.5 text-muted-foreground">
                        {isPublished ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Público
                            </span>
                        ) : (
                            "Rascunho"
                        )}
                    </Label>
                </div>

                <SettingsModal />

                <ShareModal />

                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onPreview}>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                </Button>

                <div className="w-px h-6 bg-border mx-2" />

                <Button
                    variant="default"
                    size="sm"
                    disabled={isSaving}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 border-0 transition-all hover:scale-105 active:scale-95"
                    onClick={onSave}
                >
                    <span className="font-semibold text-white">
                        {isSaving ? "Salvando..." : "Salvar"}
                    </span>
                    {!isSaving && <Check className="h-3.5 w-3.5 text-white/90" />}
                </Button>
            </div>
        </nav>
    )
}
