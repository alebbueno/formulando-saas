"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UploadStep } from "./steps/upload-step"
import { MappingStep } from "./steps/mapping-step"
import { ConfigStep } from "./steps/config-step"
import { SummaryStep } from "./steps/summary-step"
import { Upload, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { ImportPreviewData, ImportMapping, ImportConfig, executeImport } from "@/actions/import-leads"
import { toast } from "sonner"

export function ImportLeadsDialog() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Wizard State
    const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
    const [mapping, setMapping] = useState<ImportMapping>({})
    const [config, setConfig] = useState<ImportConfig>({
        projectId: "",
        ignoreDuplicates: true,
        initialStatus: "Novo Lead",
        tags: []
    })
    const [result, setResult] = useState<{ imported: number, failed: number } | null>(null)

    const handleNext = async () => {
        if (step === 0) {
            if (!previewData) return
            // Pre-fill mapping if possible based on headers
            const newMapping: ImportMapping = {}
            previewData.headers.forEach(h => {
                const norm = h.toLowerCase()
                if (norm.includes('email')) newMapping[h] = 'email'
                else if (norm.includes('nome') || norm.includes('name')) newMapping[h] = 'name'
                else if (norm.includes('empresa') || norm.includes('company')) newMapping[h] = 'company'
                else if (norm.includes('cargo') || norm.includes('job')) newMapping[h] = 'jobTitle'
                else if (norm.includes('telefone') || norm.includes('phone') || norm.includes('celular')) newMapping[h] = 'phone'
            })
            setMapping(prev => ({ ...newMapping, ...prev }))
            setStep(1)
        } else if (step === 1) {
            // Validate Name/Email mapped
            const values = Object.values(mapping)
            if (!values.includes('email') && !values.includes('name')) {
                toast.error("É necessário mapear pelo menos Nome ou Email")
                return
            }
            setStep(2)
        } else if (step === 2) {
            if (!config.projectId) {
                toast.error("Selecione um projeto/funil de destino")
                return
            }
            // Execute Import
            setIsLoading(true)
            try {
                // We send the preview rows (if we assume user uploaded small file and we trust it matches)
                // OR we just use the preview data which usually contains limited rows?
                // Wait, `parseImportFile` only returned 5 rows for preview.
                // We DON'T have the full data here if we only returned 5 rows.
                // ISSUE: The `parseImportFile` in my action returned `rows: jsonData.slice(0, 5)`.
                // So I CANNOT import all rows if I only have 5.
                // FIX: `parseImportFile` needs to handle the FULL file for final processing, 
                // OR I need to upload the file again, OR I need to store the full JSON in client state (if small enough).
                // Let's modify `ImportLeadsDialog` to keep the `file` object and send it to `executeImport` (renamed to `processLeadImport` which takes FormData).
                // BUT `executeImport` (the one I stubbed) took `rows`.
                // `processLeadImport` took `FormData`.
                // Let's use `processLeadImport(formData, mapping, config)`.

                // I need the `file` object here.
                // `UploadStep` needs to pass the `File` object back up.

                // Refactor needed: pass `file` state.

                // For now, let's assume I fix the flow below.
                const formData = new FormData()
                if (file) formData.append('file', file)

                // Oh wait, I haven't defined `file` state here yet.
                // Let's add `const [file, setFile] = useState<File | null>(null)`

                // I will add it now.

                // Call Process (I need to import the FormData version)
                // import { processLeadImport } from "@/actions/import-leads"

                // For now I put a placeholder.

            } catch (error) {
                toast.error("Erro na importação")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Helper to add File state (will fix in next edit or directly)
    const [file, setFile] = useState<File | null>(null)

    const handleProcess = async () => {
        if (!file) return
        setIsLoading(true)
        try {
            // Dynamic import to avoid circular dep issues or just standard import
            const { processLeadImport } = await import("@/actions/import-leads")
            const formData = new FormData()
            formData.append('file', file)

            const response = await processLeadImport(formData, mapping, config)

            if (response.success) {
                setResult({ imported: response.imported, failed: response.failed })
                setStep(3)
                toast.success(`${response.imported} leads importados!`)
            } else {
                toast.error("Erro ao importar leads")
            }
        } catch (e) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Leads
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Importar Leads</DialogTitle>
                    <DialogDescription>
                        Traga seus leads de planilhas CSV ou Excel.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {step === 0 && (
                        <UploadStep
                            setPreviewData={setPreviewData}
                            setFile={setFile}
                            file={file}
                        />
                    )}
                    {step === 1 && previewData && (
                        <MappingStep
                            headers={previewData.headers}
                            mapping={mapping}
                            setMapping={setMapping}
                            previewRows={previewData.rows}
                        />
                    )}
                    {step === 2 && (
                        <ConfigStep
                            config={config}
                            setConfig={setConfig}
                        />
                    )}
                    {step === 3 && result && (
                        <SummaryStep
                            result={result}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    {step < 3 && (
                        <div className="flex justify-between w-full">
                            <Button
                                variant="ghost"
                                onClick={() => step > 0 && setStep(step - 1)}
                                disabled={step === 0 || isLoading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                            </Button>

                            {step < 2 ? (
                                <Button onClick={handleNext} disabled={!file || (step === 1 && Object.keys(mapping).length === 0)}>
                                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleProcess} disabled={isLoading}>
                                    {isLoading ? "Importando..." : "Importar Leads"}
                                    {!isLoading && <Check className="ml-2 h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
