"use client"

import React, { useState } from "react"
import { uploadFile } from "@/actions/upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadControlProps {
    value: string
    onChange: (url: string) => void
    label?: string
}

export function ImageUploadControl({ value, onChange, label = "Imagem" }: ImageUploadControlProps) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const result = await uploadFile(formData, 'landing-page-assets')
            
            if (result.error) {
                toast.error(result.error)
            } else if (result.url) {
                onChange(result.url)
                toast.success("Imagem enviada!")
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error("Erro ao fazer upload")
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ""
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs">{label}</Label>
            
            <div className="flex flex-col gap-2">
                {value ? (
                    <div className="relative group border rounded-md overflow-hidden bg-slate-50 aspect-video flex items-center justify-center">
                        <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
                        <button 
                            onClick={() => onChange("")}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="border border-dashed rounded-md aspect-video flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Nenhuma imagem</span>
                    </div>
                )}

                <div className="flex gap-1">
                    <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUpload} 
                        className="hidden" 
                        id="email-image-upload" 
                        disabled={uploading}
                    />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-xs gap-1"
                        asChild
                        disabled={uploading}
                    >
                        <label htmlFor="email-image-upload" className="cursor-pointer">
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            {uploading ? "Enviando..." : "Fazer Upload de Imagem"}
                        </label>
                    </Button>
                </div>
            </div>
        </div>
    )
}
