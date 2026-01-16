"use client"

import React, { useState } from "react"
import { useLPBuilder } from "../context/lp-builder-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, Image as ImageIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageGalleryModal } from "./image-gallery-modal"
import { cn } from "@/lib/utils"

export function ImageUploadProperty() {
    const { selectedElement, updateElement, workspaceId } = useLPBuilder()
    const [uploading, setUploading] = useState(false)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const supabase = createClient()

    if (selectedElement?.type !== 'image') return null

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
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

            updateElement(selectedElement.id, { url: data.publicUrl })
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Imagem</h3>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
                    <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                    <TabsTrigger value="gallery" className="text-xs">Galeria</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-3">
                    <div className="space-y-2">
                        <Label className="text-xs">Enviar Arquivo</Label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="hidden"
                                id="image-upload"
                            />
                            <Label
                                htmlFor="image-upload"
                                className="flex-1 flex items-center justify-center p-2 border border-dashed rounded cursor-pointer hover:bg-muted/50 text-xs transition-colors h-20 flex-col gap-2 text-muted-foreground hover:text-foreground"
                            >
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                    <Upload className="h-6 w-6" />
                                )}
                                {uploading ? "Enviando..." : "Clique para selecionar"}
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">OU URL Externa</Label>
                        <Input
                            className="h-8 text-xs"
                            value={selectedElement.url || ''}
                            onChange={(e) => updateElement(selectedElement.id, { url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </TabsContent>

                <TabsContent value="gallery" className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col gap-2 border-dashed"
                        onClick={() => setIsGalleryOpen(true)}
                    >
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs font-normal">Abrir Galeria do Workspace</span>
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center px-4">
                        Busque e reuse imagens que você já enviou neste workspace.
                    </p>
                </TabsContent>
            </Tabs>

            {selectedElement.url && (
                <div className="mt-2 border rounded p-1 bg-slate-50/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedElement.url} alt="Preview" className="w-full h-auto max-h-[100px] object-contain" />
                </div>
            )}

            <ImageGalleryModal
                open={isGalleryOpen}
                onOpenChange={setIsGalleryOpen}
                workspaceId={workspaceId}
                onSelect={(url) => updateElement(selectedElement.id, { url })}
            />
        </div>
    )
}
