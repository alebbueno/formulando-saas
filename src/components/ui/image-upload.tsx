"use client"

import { useState, useRef, ChangeEvent } from "react"
import { uploadFile } from "@/actions/upload"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
    accept?: string
    maxSizeMB?: number
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    accept = "image/png, image/x-icon, image/vnd.microsoft.icon",
    maxSizeMB = 2
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Client-side validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`O arquivo deve ser menor que ${maxSizeMB}MB`)
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const result = await uploadFile(formData)

            if (result.error) {
                toast.error(result.error)
            } else if (result.url) {
                onChange(result.url)
                toast.success("Upload concluído!")
            }
        } catch (error) {
            toast.error("Erro ao fazer upload")
        } finally {
            setIsUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />

            {value ? (
                <div className="relative w-16 h-16 border rounded-md overflow-hidden bg-slate-50 flex items-center justify-center group">
                    {/* Render standard img for favicon support since next/image works best with known dimensions */}
                    <img
                        src={value}
                        alt="Favicon"
                        className="w-10 h-10 object-contain"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        disabled={disabled}
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            ) : (
                <div className="w-16 h-16 border border-dashed rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                </div>
            )}

            <div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? "Enviando..." : "Upload Imagem"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                    PNG ou ICO até {maxSizeMB}MB
                </p>
            </div>
        </div>
    )
}
