"use client"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MERGE_TAG_CATEGORIES } from "@/lib/email-merge-tags"
import { Tag, Search } from "lucide-react"
import { useState } from "react"

interface MergeTagPickerProps {
    onSelect: (tag: string) => void
}

export function MergeTagPicker({ onSelect }: MergeTagPickerProps) {
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)

    const allTags = Object.entries(MERGE_TAG_CATEGORIES).flatMap(([category, tags]) =>
        tags.map(tag => ({ ...tag, category }))
    )

    const filteredTags = allTags.filter(
        (tag) =>
            tag.label.toLowerCase().includes(search.toLowerCase()) ||
            tag.tag.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (tag: string) => {
        onSelect(tag)
        setOpen(false)
        setSearch("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <Tag className="mr-2 h-3.5 w-3.5" />
                    Merge Tags
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar merge tag..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {Object.entries(MERGE_TAG_CATEGORIES).map(([category, tags]) => {
                        const visibleTags = tags.filter(tag =>
                            filteredTags.some(ft => ft.tag === tag.tag)
                        )

                        if (visibleTags.length === 0) return null

                        return (
                            <div key={category} className="p-3 border-b last:border-0">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">
                                    {category === 'lead' && '👤 Lead'}
                                    {category === 'workspace' && '🏢 Workspace'}
                                    {category === 'user' && '👨‍💼 Usuário'}
                                    {category === 'system' && '⚙️ Sistema'}
                                </h4>
                                <div className="space-y-1">
                                    {visibleTags.map((tag) => (
                                        <button
                                            key={tag.tag}
                                            onClick={() => handleSelect(tag.tag)}
                                            className="w-full px-2 py-1.5 text-left rounded hover:bg-accent transition-colors group"
                                        >
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-sm font-medium">{tag.label}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-[10px] opacity-70 group-hover:opacity-100"
                                                >
                                                    {tag.tag}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Ex: {tag.example}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                    {filteredTags.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            Nenhum merge tag encontrado
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
