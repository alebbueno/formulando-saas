"use client"

import React, { useState, useEffect } from "react"
import { useLPBuilder } from "../context/lp-builder-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bold, Type, Link as LinkIcon, Palette, MousePointer2 } from "lucide-react"

const GOOGLE_FONTS = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Oswald",
    "Raleway"
]

export function ButtonControl() {
    const { selectedElement, updateElement } = useLPBuilder()

    // Local state for optimistic updates
    const [label, setLabel] = useState("")
    const [url, setUrl] = useState("")

    useEffect(() => {
        if (selectedElement && selectedElement.type === 'button') {
            setLabel(selectedElement.content || "")
            setUrl(selectedElement.url || "")
        }
    }, [selectedElement])

    if (!selectedElement || selectedElement.type !== 'button') return null

    const styles = selectedElement.styles || {}
    const hoverStyles = selectedElement.properties?.hoverStyles || {}

    const handleStyleChange = (key: string, value: string) => {
        updateElement(selectedElement.id, {
            styles: { ...styles, [key]: value }
        })
    }

    const handleHoverStyleChange = (key: string, value: string) => {
        updateElement(selectedElement.id, {
            properties: {
                ...selectedElement.properties,
                hoverStyles: { ...hoverStyles, [key]: value }
            }
        })
    }

    const handleContentChange = (newLabel: string) => {
        setLabel(newLabel)
        updateElement(selectedElement.id, { content: newLabel })
    }

    const handleUrlChange = (newUrl: string) => {
        setUrl(newUrl)
        updateElement(selectedElement.id, { url: newUrl })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Conteúdo
                </h3>

                <div className="space-y-2">
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                        value={label}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Clique aqui"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Link de Destino (URL)</Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={url}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="https://..."
                            className="pl-8"
                        />
                    </div>
                    {/* Open in new tab toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <Label className="text-xs cursor-pointer">Abrir em nova aba</Label>
                        <Switch
                            checked={selectedElement.properties?.openInNewTab !== false}
                            onCheckedChange={(checked) => {
                                updateElement(selectedElement.id, {
                                    properties: {
                                        ...selectedElement.properties,
                                        openInNewTab: checked
                                    }
                                })
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Aparência
                </h3>

                <Tabs defaultValue="normal" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="normal">Normal</TabsTrigger>
                        <TabsTrigger value="hover">Hover</TabsTrigger>
                    </TabsList>

                    <TabsContent value="normal" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Cor do Texto</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={styles.color || "#ffffff"}
                                        onChange={(e) => handleStyleChange('color', e.target.value)}
                                        className="w-8 h-8 p-0 border-none cursor-pointer"
                                    />
                                    <Input
                                        value={styles.color || "#ffffff"}
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
                                        value={styles.backgroundColor || "#000000"}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                        className="w-8 h-8 p-0 border-none cursor-pointer"
                                    />
                                    <Input
                                        value={styles.backgroundColor || "#000000"}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                        className="h-8 text-xs flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Cor da Borda</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={styles.borderColor || "transparent"}
                                    onChange={(e) => {
                                        handleStyleChange('borderColor', e.target.value)
                                        if (!styles.borderWidth) handleStyleChange('borderWidth', '1px')
                                        if (!styles.borderStyle) handleStyleChange('borderStyle', 'solid')
                                    }}
                                    className="w-8 h-8 p-0 border-none cursor-pointer"
                                />
                                <Input
                                    value={styles.borderColor || "transparent"}
                                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                                    className="h-8 text-xs flex-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="hover" className="space-y-4 pt-4">
                        <p className="text-[10px] text-muted-foreground">Estilos do botão ao passar o mouse.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Texto (Hover)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={hoverStyles.color || styles.color || "#ffffff"}
                                        onChange={(e) => handleHoverStyleChange('color', e.target.value)}
                                        className="w-8 h-8 p-0 border-none cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Fundo (Hover)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={hoverStyles.backgroundColor || styles.backgroundColor || "#000000"}
                                        onChange={(e) => handleHoverStyleChange('backgroundColor', e.target.value)}
                                        className="w-8 h-8 p-0 border-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Borda (Hover)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={hoverStyles.borderColor || styles.borderColor || "transparent"}
                                    onChange={(e) => handleHoverStyleChange('borderColor', e.target.value)}
                                    className="w-8 h-8 p-0 border-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Bold className="w-4 h-4" />
                    Tipografia
                </h3>

                <div className="space-y-2">
                    <Label className="text-xs">Fonte</Label>
                    <Select
                        value={styles.fontFamily?.replace(/['"]/g, '') || "Inter"}
                        onValueChange={(val) => handleStyleChange('fontFamily', `'${val}', sans-serif`)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {GOOGLE_FONTS.map(font => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Tamanho</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={parseInt(styles.fontSize || "16")}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                className="h-8 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">px</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Peso</Label>
                        <Select
                            value={styles.fontWeight || "400"}
                            onValueChange={(val) => handleStyleChange('fontWeight', val)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="300">Leve</SelectItem>
                                <SelectItem value="400">Normal</SelectItem>
                                <SelectItem value="600">Semi-Bold</SelectItem>
                                <SelectItem value="700">Bold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Alinhamento</Label>
                    <Select
                        value={styles.textAlign || 'center'}
                        onValueChange={(val) => handleStyleChange('textAlign', val)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                            <SelectItem value="justify">Justificado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between">
                    <Label className="text-xs">Maiúsculas (Uppercase)</Label>
                    <Switch
                        checked={styles.textTransform === 'uppercase'}
                        onCheckedChange={(checked) => handleStyleChange('textTransform', checked ? 'uppercase' : 'none')}
                    />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Dimensões
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Largura</Label>
                        <Input
                            placeholder="auto"
                            value={styles.width || ''}
                            onChange={(e) => handleStyleChange('width', e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Altura</Label>
                        <Input
                            placeholder="auto"
                            value={styles.height || ''}
                            onChange={(e) => handleStyleChange('height', e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Use px, %, rem, etc. Ex: 200px, 100%, auto
                </p>
            </div>
        </div>
    )
}
