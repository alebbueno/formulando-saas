"use client"

import React, { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
// import { useLPBuilder } from "../context/lp-builder-context"

const units = ["auto", "px", "%"] as const
type Unit = (typeof units)[number]

interface SizeControlProps {
    width?: string
    height?: string
    onChangeWidth: (val: string) => void
    onChangeHeight: (val: string) => void
}

export function SizeControl({ width, height, onChangeWidth, onChangeHeight }: SizeControlProps) {
    // Helper to parse value and unit from style string (e.g. "100px" -> { value: "100", unit: "px" })
    const parseSize = (value: string | undefined): { val: string, unit: Unit } => {
        if (!value || value === "auto") return { val: "", unit: "auto" }
        if (value.endsWith("%")) return { val: value.replace("%", ""), unit: "%" }
        if (value.endsWith("px")) return { val: value.replace("px", ""), unit: "px" }
        // Fallback for number only (assume px) or unknown
        if (!isNaN(Number(value))) return { val: value, unit: "px" }
        return { val: "", unit: "auto" }
    }

    const [widthState, setWidthState] = useState<{ val: string, unit: Unit }>({ val: "", unit: "auto" })
    const [heightState, setHeightState] = useState<{ val: string, unit: Unit }>({ val: "", unit: "auto" })

    // Sync with props
    useEffect(() => {
        setWidthState(parseSize(width))
        setHeightState(parseSize(height))
    }, [width, height])

    const handleUpdate = (dim: 'width' | 'height', val: string, unit: Unit) => {
        let newValue = "auto"
        if (unit !== "auto") {
            const num = val === "" ? "" : val // Allow empty string while typing
            if (num === "") return // Don't allow empty value to be saved as "px" yet or handle it? 
            // Better: if empty, maybe don't update parent yet? Or update as empty+unit?
            // Existing logic was: const num = val === "" ? "100" : val.
            // Let's stick to safe fallback if user commits, but for controlled input we want to pass valid CSS.

            const cleanNum = val === "" ? "0" : val
            newValue = `${cleanNum}${unit}`
        }

        if (dim === 'width') onChangeWidth(newValue)
        else onChangeHeight(newValue)
    }

    return (
        <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground">Tamanho (Size)</h4>

            {/* Width Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Largura (Width)</Label>
                </div>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={widthState.val}
                        placeholder={widthState.unit === 'auto' ? "Auto" : "0"}
                        disabled={widthState.unit === 'auto'}
                        onChange={(e) => {
                            const newVal = e.target.value
                            setWidthState(prev => ({ ...prev, val: newVal }))
                            handleUpdate('width', newVal, widthState.unit)
                        }}
                        className="h-8 text-xs"
                    />
                    <ToggleGroup
                        type="single"
                        value={widthState.unit}
                        onValueChange={(value: string) => {
                            if (!value) return
                            const newUnit = value as Unit
                            setWidthState(prev => ({ ...prev, unit: newUnit }))
                            handleUpdate('width', widthState.val, newUnit)
                        }}
                        className="border rounded-md"
                    >
                        <ToggleGroupItem value="auto" className="h-8 px-2 text-xs" title="Auto">A</ToggleGroupItem>
                        <ToggleGroupItem value="px" className="h-8 px-2 text-xs" title="Pixels">PX</ToggleGroupItem>
                        <ToggleGroupItem value="%" className="h-8 px-2 text-xs" title="Percentage">%</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Height Control */}
            <div className="space-y-2">
                <Label className="text-xs">Altura (Height)</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={heightState.val}
                        placeholder={heightState.unit === 'auto' ? "Auto" : "0"}
                        disabled={heightState.unit === 'auto'}
                        onChange={(e) => {
                            const newVal = e.target.value
                            setHeightState(prev => ({ ...prev, val: newVal }))
                            handleUpdate('height', newVal, heightState.unit)
                        }}
                        className="h-8 text-xs"
                    />
                    <ToggleGroup
                        type="single"
                        value={heightState.unit}
                        onValueChange={(value: string) => {
                            if (!value) return
                            const newUnit = value as Unit
                            setHeightState(prev => ({ ...prev, unit: newUnit }))
                            handleUpdate('height', heightState.val, newUnit)
                        }}
                        className="border rounded-md"
                    >
                        <ToggleGroupItem value="auto" className="h-8 px-2 text-xs" title="Auto">A</ToggleGroupItem>
                        <ToggleGroupItem value="px" className="h-8 px-2 text-xs" title="Pixels">PX</ToggleGroupItem>
                        <ToggleGroupItem value="%" className="h-8 px-2 text-xs" title="Percentage">%</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
        </div>
    )
}
