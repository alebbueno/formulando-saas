"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Copy, Check, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface DNSConfigModalProps {
    isOpen: boolean
    onClose: () => void
    domain: any
}

export function DNSConfigModal({ isOpen, onClose, domain }: DNSConfigModalProps) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedValue(text)
        toast.success("Copiado!")
        setTimeout(() => setCopiedValue(null), 2000)
    }

    const records = domain?.dns_records || []

    const getRecordPurpose = (record: any) => {
        const type = (record.type || record.record)?.toUpperCase()
        const name = record.name?.toLowerCase()
        const value = record.value?.toLowerCase()

        if (name?.includes("_domainkey") || value?.includes("dkim")) return { label: "DKIM", description: "Assinatura de Segurança" }
        if (value?.includes("v=spf1")) return { label: "SPF", description: "Autorização de Envio" }
        if (type === "MX") return { label: "MX", description: "Recebimento de Emails" }
        if (name?.includes("_dmarc")) return { label: "DMARC", description: "Política de Segurança" }
        return { label: "Outro", description: "Configuração Adicional" }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Configurações DNS para {domain?.domain}</DialogTitle>
                    <DialogDescription>
                        Adicione os seguintes registros ao seu provedor de DNS para verificar o domínio e habilitar o envio de e-mails.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">Tipo</TableHead>
                                <TableHead className="w-[150px]">Configuração</TableHead>
                                <TableHead>Nome/Host</TableHead>
                                <TableHead>Valor/Conteúdo</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.map((record: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-xs font-bold uppercase">{record.type || record.record}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <Badge variant="outline" className="w-fit text-[10px] px-1 h-4">
                                                {getRecordPurpose(record).label}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {getRecordPurpose(record).description}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-mono text-[10px]" title={record.name}>{record.name}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 shrink-0"
                                                onClick={() => copyToClipboard(record.name)}
                                            >
                                                {copiedValue === record.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[200px] font-mono text-[10px]" title={record.value}>{record.value}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 shrink-0"
                                                onClick={() => copyToClipboard(record.value)}
                                            >
                                                {copiedValue === record.value ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 p-4 bg-muted/30 rounded-lg border text-xs space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                        <HelpCircle className="h-3 w-3" />
                        Como configurar no seu provedor (HostGator, Cloudflare, etc):
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li>No campo <strong>Tipo</strong> do seu provedor, selecione exatamente o que aparece na primeira coluna abaixo (ex: <code className="bg-muted px-1 rounded">CNAME</code> ou <code className="bg-muted px-1 rounded">TXT</code>).</li>
                        <li><strong>Dica HostGator:</strong> Selecione <code className="bg-muted px-1 rounded">CNAME</code> para registros DKIM e <code className="bg-muted px-1 rounded">TXT</code> para SPF/DMARC.</li>
                        <li>A propagação pode levar de alguns minutos a 24 horas.</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
}
