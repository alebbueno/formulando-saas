"use client"

import React from "react"
import { Variable, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MERGE_TAGS } from "../constants"
import { cn } from "@/lib/utils"

interface EmailMergeTagSelectorProps {
    onSelect: (tag: string) => void
    className?: string
    size?: "sm" | "icon" | "default"
}

export function EmailMergeTagSelector({ onSelect, className, size = "icon" }: EmailMergeTagSelectorProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    size={size} 
                    className={cn("h-8 w-8 text-slate-500", className)}
                    title="Inserir Variável"
                >
                    <Variable size={14} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 z-[10001]" side="top" align="end">
                <div className="flex flex-col max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 border-b bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Inserir Variável
                    </div>
                    {MERGE_TAGS.map(tag => (
                        <button
                            key={tag.value}
                            className="px-3 py-2 text-left text-xs hover:bg-slate-100 transition-colors flex items-center justify-between group"
                            onClick={() => onSelect(tag.value)}
                        >
                            <span>{tag.label}</span>
                            <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-mono">{tag.value}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
