"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface SummaryStepProps {
    result: {
        imported: number
        failed: number
    }
    onClose: () => void
}

export function SummaryStep({ result, onClose }: SummaryStepProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 h-full space-y-6 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold">Importação Concluída!</h3>
                <p className="text-muted-foreground">
                    Seus leads foram processados.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="border rounded-lg p-4 bg-muted/20">
                    <p className="text-3xl font-bold text-green-600">{result.imported}</p>
                    <p className="text-sm text-muted-foreground">Importados</p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/20">
                    <p className={`text-3xl font-bold ${result.failed > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {result.failed}
                    </p>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
            </div>

            <Button onClick={onClose} size="lg" className="min-w-[200px]">
                Concluir
            </Button>
        </div>
    )
}
