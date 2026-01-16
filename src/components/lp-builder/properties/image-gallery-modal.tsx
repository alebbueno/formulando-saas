"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, ImageIcon, FolderOpen, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ImageGalleryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
    workspaceId: string | null
}

export function ImageGalleryModal({ open, onOpenChange, onSelect, workspaceId }: ImageGalleryModalProps) {
    const [images, setImages] = useState<{ name: string; url: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDragging, setIsDragging] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchGallery()
        }
    }, [open, workspaceId])

    const fetchGallery = async () => {
        setLoading(true)
        try {
            console.log("Fetching gallery for workspace:", workspaceId)

            // 1. Fetch Workspace Images
            const workspacePromise = workspaceId
                ? supabase.storage.from('lp-images').list(`${workspaceId}`, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                })
                : Promise.resolve({ data: [], error: null })

            // 2. Fetch Root Images (Legacy/Global) - cautious about mixing, but user asked for "imgs ja fiz upload"
            const rootPromise = supabase.storage.from('lp-images').list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            })

            const [workspaceRes, rootRes] = await Promise.all([workspacePromise, rootPromise])

            console.log("Workspace response:", JSON.stringify(workspaceRes, null, 2))
            console.log("Root response:", JSON.stringify(rootRes, null, 2))

            if (workspaceRes.error) console.error("Workspace fetch error:", workspaceRes.error)
            if (rootRes.error) console.error("Root fetch error:", rootRes.error)

            let allFiles: any[] = []

            const isImage = (file: any) => {
                if (file.metadata?.mimetype?.startsWith('image/')) return true
                // Fallback: check extension
                if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)) return true
                return false
            }

            // Process Workspace Files
            if (workspaceRes.data) {
                const wsFiles = workspaceRes.data
                    .filter(file => isImage(file))
                    .map(file => ({
                        name: file.name,
                        // Workspace files need path prefix
                        url: supabase.storage.from('lp-images').getPublicUrl(`${workspaceId}/${file.name}`).data.publicUrl,
                        created_at: file.created_at
                    }))
                allFiles = [...allFiles, ...wsFiles]
            }

            // Process Root Files (Legacy)
            if (rootRes.data) {
                const rootFiles = rootRes.data
                    .filter(file => isImage(file) && file.name !== '.emptyFolderPlaceholder')
                    .map(file => ({
                        name: file.name,
                        // Root files are just filename
                        url: supabase.storage.from('lp-images').getPublicUrl(file.name).data.publicUrl,
                        created_at: file.created_at
                    }))
                allFiles = [...allFiles, ...rootFiles]
            }

            // Initial sort by date desc
            allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            console.log("Fetched images:", allFiles.length)
            setImages(allFiles)

        } catch (error) {
            console.error('Error fetching gallery:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (file: File) => {
        console.log("Starting upload...", file.name, "Workspace:", workspaceId)
        if (!workspaceId) {
            console.error("No workspace ID found!")
            alert("Erro: ID do workspace não encontrado.")
            return
        }

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${workspaceId}/${fileName}`

            console.log("Uploading to:", filePath)

            const { error: uploadError, data } = await supabase.storage
                .from('lp-images')
                .upload(filePath, file)

            if (uploadError) {
                console.error("Supabase upload error:", uploadError)
                throw uploadError
            }

            console.log("Upload success:", data)

            // Refresh gallery after upload
            await fetchGallery()
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        const imageFile = files.find(f => f.type.startsWith('image/'))

        if (imageFile) {
            await handleUpload(imageFile)
        }
    }

    const filteredImages = images.filter(img =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-3xl h-[80vh] flex flex-col"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center backdrop-blur-[1px] m-4 pointer-events-none">
                        <div className="bg-background p-4 rounded-full shadow-lg">
                            <Upload className="h-8 w-8 text-primary animate-bounce" />
                        </div>
                        <p className="mt-4 text-lg font-semibold text-primary">Solte a imagem para enviar</p>
                    </div>
                )}

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Galeria do Workspace
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 py-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar imagem por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <label htmlFor="gallery-upload" className={cn(ButtonVariants({ variant: "default", size: "sm" }), "cursor-pointer gap-2")}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            <span className="hidden sm:inline">Enviar</span>
                        </label>
                        <input
                            id="gallery-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleUpload(file)
                            }}
                            disabled={uploading}
                        />
                        <Button variant="outline" size="icon" onClick={fetchGallery} title="Atualizar">
                            <Loader2 className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 border rounded-md p-4 bg-slate-50/50">
                    {loading && images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Carregando imagens...</p>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-20">
                            <div className="bg-white p-4 rounded-full border shadow-sm">
                                <ImageIcon className="h-10 w-10 opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Nenhuma imagem encontrada</p>
                                <p className="text-xs mt-1">Arraste uma imagem aqui ou use o botão de upload</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    className="group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all text-left flex flex-col"
                                    onClick={() => {
                                        onSelect(img.url)
                                        // onOpenChange(false) // Keeping it open might be better if user wants to see it added? But usually selection means "pick this one". 
                                        // User request was "reused via gallery", implies selection.
                                        onOpenChange(false)
                                    }}
                                >
                                    <div className="flex-1 overflow-hidden relative w-full">
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <div className="p-2 border-t bg-white text-xs truncate w-full text-slate-600 font-medium">
                                        {img.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Importing button variants for the label usage
import { buttonVariants as ButtonVariants } from "@/components/ui/button"
