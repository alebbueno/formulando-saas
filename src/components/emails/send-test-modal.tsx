"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getDomains } from "@/actions/domain-actions"
import { sendTestEmail } from "@/actions/emails"
import { Loader2, Mail } from "lucide-react"

interface SendTestModalProps {
    templateId: string
    workspaceId: string
    templateName: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function SendTestModal({
    templateId,
    workspaceId,
    templateName,
    isOpen,
    onOpenChange,
}: SendTestModalProps) {
    const [recipient, setRecipient] = useState("")
    const [fromPrefix, setFromPrefix] = useState("contato")
    const [domains, setDomains] = useState<any[]>([])
    const [selectedDomain, setSelectedDomain] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingDomains, setIsFetchingDomains] = useState(true)

    // Load available domains when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchDomains = async () => {
                setIsFetchingDomains(true)
                try {
                    const res = await getDomains(workspaceId)
                    if (res.success && res.data) {
                        const verified = res.data.filter((d: any) => d.status === "verified")
                        setDomains(verified)
                        if (verified.length > 0) {
                            const default_ = verified.find((d: any) => d.is_default) || verified[0]
                            setSelectedDomain(default_.domain)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching domains:", error)
                    toast.error("Erro ao carregar seus domínios.")
                } finally {
                    setIsFetchingDomains(false)
                }
            }
            fetchDomains()
        }
    }, [isOpen, workspaceId])

    const handleSend = async () => {
        if (!recipient || !recipient.trim()) {
            toast.error("Por favor, informe o e-mail do destinatário.")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(recipient)) {
            toast.error("Por favor, insira um e-mail válido.")
            return
        }

        if (!selectedDomain) {
            toast.error("Você precisa selecionar um domínio para enviar.")
            return
        }

        setIsLoading(true)
        try {
            const res = await sendTestEmail(
                templateId,
                recipient,
                workspaceId,
                fromPrefix
            )

            if (res.success) {
                toast.success("E-mail de teste enviado com sucesso!")
                onOpenChange(false)
            } else {
                toast.error(res.error || "Erro ao enviar e-mail de teste.")
            }
        } catch (error) {
            console.error("sendTestEmail UI Error:", error)
            toast.error("Erro inesperado ao realizar o envio de teste.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Enviar E-mail de Teste
                    </DialogTitle>
                    <DialogDescription>
                        Envie uma versão real do template "{templateName}" para verificar o visual e entregabilidade.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="recipient">E-mail do Destinatário</Label>
                        <Input
                            id="recipient"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                        <p className="text-[11px] text-muted-foreground">
                            As merge tags (ex: <code>{"{{lead.name}}"}</code>) serão preenchidas com dados de teste.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prefix">Prefixo Remetente</Label>
                            <Input
                                id="prefix"
                                placeholder="contato"
                                value={fromPrefix}
                                onChange={(e) => setFromPrefix(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domínio de Envio</Label>
                            {isFetchingDomains ? (
                                <div className="h-10 flex items-center justify-center border rounded-md bg-muted/20">
                                    <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                </div>
                            ) : (
                                <Select 
                                    value={selectedDomain} 
                                    onValueChange={setSelectedDomain} 
                                    disabled={domains.length === 0}
                                >
                                    <SelectTrigger id="domain">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {domains.map((d) => (
                                            <SelectItem key={d.id} value={d.domain}>
                                                @{d.domain}
                                            </SelectItem>
                                        ))}
                                        {domains.length === 0 && (
                                            <SelectItem value="none" disabled>
                                                Sem domínios verificados
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    
                    {domains.length === 0 && !isFetchingDomains && (
                        <p className="text-[11px] text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                            Poxa! Você ainda não tem domínios verificados. Verifique um domínio em Configurações para realizar envios.
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSend} 
                        disabled={isLoading || domains.length === 0}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar agora"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
