"use client"

import { useState } from "react"
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
import { addDomain } from "@/actions/domain-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddDomainModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    workspaceId: string
}

export function AddDomainModal({ isOpen, onClose, onSuccess, workspaceId }: AddDomainModalProps) {
    const [domainName, setDomainName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!domainName) {
            toast.error("Por favor, insira o nome do domínio.")
            return
        }

        // Basic validation
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
        if (!domainRegex.test(domainName.toLowerCase())) {
            toast.error("Formato de domínio inválido (ex: mail.exemplo.com)")
            return
        }

        setIsSubmitting(true)
        const result = await addDomain(workspaceId, domainName.toLowerCase())
        
        if (result.success) {
            toast.success("Domínio adicionado com sucesso!")
            onSuccess()
            onClose()
            setDomainName("")
        } else {
            toast.error(result.error || "Erro ao adicionar domínio.")
        }
        setIsSubmitting(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Domínio</DialogTitle>
                        <DialogDescription>
                            Insira o domínio que deseja usar para enviar seus e-mails. Recomendamos o uso de um subdomínio como <code className="bg-muted px-1 rounded">mail.seusite.com</code>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domínio</Label>
                            <Input
                                id="domain"
                                placeholder="mail.seusite.com"
                                value={domainName}
                                onChange={(e) => setDomainName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Adicionar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
