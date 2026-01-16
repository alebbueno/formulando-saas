"use client"

import React, { useState } from "react"
import { useLPBuilder } from "../context/lp-builder-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackgroundControl() {
    const { selectedElement, updateElement, workspaceId } = useLPBuilder()
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    if (!selectedElement) return null

    const styles = selectedElement.styles || {}
    const hasBackgroundImage = !!styles.backgroundImage && styles.backgroundImage !== 'none'

    const handleStyleChange = (key: string, value: string) => {
        updateElement(selectedElement.id, {
            styles: {
                ...selectedElement.styles,
                [key]: value
            }
        })
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `bg-${Math.random()}.${fileExt}`
            // Use workspaceId folder if available, else root
            const filePath = workspaceId ? `${workspaceId}/${fileName}` : `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('lp-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('lp-images')
                .getPublicUrl(filePath)

            updateElement(selectedElement.id, {
                styles: {
                    ...selectedElement.styles,
                    backgroundImage: `url('${data.publicUrl}')`,
                    backgroundSize: 'cover', // set defaults
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }
            })
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    const removeBackground = () => {
        const newStyles = { ...selectedElement.styles }
        delete newStyles.backgroundImage
        delete newStyles.backgroundSize
        delete newStyles.backgroundPosition
        delete newStyles.backgroundRepeat
        updateElement(selectedElement.id, { styles: newStyles })
    }

    const currentUrl = styles.backgroundImage?.replace(/url\(['"]?(.+?)['"]?\)/, '$1')

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label className="text-xs">Image</Label>

                {hasBackgroundImage ? (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 border rounded p-2 text-xs truncate bg-muted/20">
                            {currentUrl}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={removeBackground}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                            id="bg-image-upload"
                        />
                        <Label
                            htmlFor="bg-image-upload"
                            className="w-full flex items-center justify-center p-2 border border-dashed rounded cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground"
                        >
                            {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            {uploading ? "Enviando..." : "Upload Background"}
                        </Label>
                    </div>
                )}
            </div>

            {hasBackgroundImage && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Position</Label>
                            <Select
                                value={styles.backgroundPosition || 'center'}
                                onValueChange={(val) => handleStyleChange('backgroundPosition', val)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="top">Top</SelectItem>
                                    <SelectItem value="bottom">Bottom</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Size</Label>
                            <Select
                                value={styles.backgroundSize || 'cover'}
                                onValueChange={(val) => handleStyleChange('backgroundSize', val)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cover">Cover</SelectItem>
                                    <SelectItem value="contain">Contain</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Repeat</Label>
                        <Select
                            value={styles.backgroundRepeat || 'no-repeat'}
                            onValueChange={(val) => handleStyleChange('backgroundRepeat', val)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Repeat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no-repeat">No Repeat</SelectItem>
                                <SelectItem value="repeat">Repeat</SelectItem>
                                <SelectItem value="repeat-x">Repeat X</SelectItem>
                                <SelectItem value="repeat-y">Repeat Y</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </div>
    )
}
