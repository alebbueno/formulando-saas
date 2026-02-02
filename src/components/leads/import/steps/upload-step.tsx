"use client"

import { useState, useCallback } from "react"
// import { useDropzone } from "react-dropzone" 
import { Button } from "@/components/ui/button"
import { Upload, Loader2, X, Check } from "lucide-react"
import { ImportPreviewData, parseImportFile } from "@/actions/import-leads"
import { toast } from "sonner"

interface UploadStepProps {
    setPreviewData: (data: ImportPreviewData | null) => void
    setFile: (file: File | null) => void
    file: File | null
}

export function UploadStep({ setPreviewData, setFile, file }: UploadStepProps) {
    const [isParsing, setIsParsing] = useState(false)
    const [isDragActive, setIsDragActive] = useState(false)

    // Manual Drag and Drop handling if not using library to save time/deps
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(true)
    }

    const onDragLeave = () => {
        setIsDragActive(false)
    }

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFile(droppedFile)
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = async (selectedFile: File) => {
        // Validate type
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        // Some browsers have weird mime types, check extension too
        const ext = selectedFile.name.split('.').pop()?.toLowerCase()
        if (!['csv', 'xls', 'xlsx'].includes(ext || '')) {
            toast.error("Por favor envie um arquivo CSV ou Excel (.xls, .xlsx)")
            return
        }

        setFile(selectedFile)
        setIsParsing(true)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const result = await parseImportFile(formData)

            if (result.success && result.data) {
                setPreviewData(result.data)
                toast.success("Arquivo lido com sucesso!")
            } else {
                toast.error(result.error || "Erro ao ler arquivo")
                setFile(null)
            }
        } catch (error) {
            toast.error("Erro inesperado ao processar arquivo")
            setFile(null)
        } finally {
            setIsParsing(false)
        }
    }

    const removeFile = () => {
        setFile(null)
        setPreviewData(null)
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 h-full space-y-4">
            {!file ? (
                <div
                    className={`
                        w-full max-w-md h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv,.xls,.xlsx"
                        onChange={onInputChange}
                    />
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium text-lg">Clique ou arraste seu arquivo aqui</p>
                        <p className="text-sm text-muted-foreground mt-1">Suporta CSV, Excel (.xls, .xlsx)</p>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md border rounded-lg p-6 bg-card flex flex-col items-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        {isParsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                        <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="pt-2">
                        <Button variant="outline" size="sm" onClick={removeFile} className="text-destructive hover:text-destructive">
                            <X className="mr-2 h-4 w-4" /> Remover Arquivo
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
