"use client"

import { ImportMapping } from "@/actions/import-leads"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MappingStepProps {
    headers: string[]
    mapping: ImportMapping
    setMapping: React.Dispatch<React.SetStateAction<ImportMapping>>
    previewRows: any[]
}

const SYSTEM_FIELDS = [
    { value: "name", label: "Nome" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Telefone" },
    { value: "company", label: "Empresa" },
    { value: "jobTitle", label: "Cargo" },
    // Later: Custom fields support like "custom:Field Name"
]

export function MappingStep({ headers, mapping, setMapping, previewRows }: MappingStepProps) {

    const handleMapChange = (header: string, value: string) => {
        setMapping(prev => {
            const newMap = { ...prev }
            if (value === "ignore") {
                delete newMap[header]
            } else {
                newMap[header] = value
            }
            return newMap
        })
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="px-1">
                <h3 className="text-lg font-medium">Mapeamento de Colunas</h3>
                <p className="text-sm text-muted-foreground">
                    Associe as colunas do seu arquivo aos campos do sistema.
                </p>
            </div>

            <div className="border rounded-md flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Coluna do Arquivo</TableHead>
                                <TableHead className="w-[200px]">Campo no Sistema</TableHead>
                                <TableHead className="text-muted-foreground">Exemplo (Linha 1)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {headers.map((header) => {
                                const mappedValue = mapping[header]
                                const previewValue = previewRows[0] ? previewRows[0][header] : "-"

                                return (
                                    <TableRow key={header}>
                                        <TableCell className="font-medium">{header}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={mappedValue || "ignore"}
                                                onValueChange={(val) => handleMapChange(header, val)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Ignorar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ignore" className="text-muted-foreground">Ignorar coluna</SelectItem>
                                                    {SYSTEM_FIELDS.map(f => (
                                                        <SelectItem key={f.value} value={f.value}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {typeof previewValue === 'object' ? JSON.stringify(previewValue) : String(previewValue)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            <div className="bg-muted p-3 rounded text-xs text-muted-foreground">
                <span className="font-semibold">Dica:</span> Campos marcados como "Ignorar" não serão importados. Nome ou Email são obrigatórios.
            </div>
        </div>
    )
}
