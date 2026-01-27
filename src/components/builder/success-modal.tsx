"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, ExternalLink, ArrowRight, PartyPopper } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectSlug: string
    projectName: string
}

export function SuccessModal({ open, onOpenChange, projectSlug, projectName }: SuccessModalProps) {
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    const shareUrl = `${origin}/submit/${projectSlug}`

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success("Link copiado!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDashboard = () => {
        router.push("/dashboard")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in duration-300">
                        <PartyPopper className="h-8 w-8" />
                    </div>
                </div>

                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-bold flex flex-col items-center gap-2">
                        Parabéns! 🚀
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Seu formulário <span className="font-semibold text-foreground">"{projectName}"</span> está no ar.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-6 text-left">
                    <div className="space-y-2">
                        <Label>Link para compartilhar</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="font-mono text-sm bg-muted/50 selection:bg-primary/20"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 bg-background hover:bg-muted">
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button
                        onClick={() => window.open(shareUrl, '_blank')}
                        variant="outline"
                        className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Ver formulário ao vivo
                    </Button>

                    <Button onClick={handleDashboard} className="w-full gap-2 font-semibold shadow-lg shadow-primary/20">
                        Ir para Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="mt-2 text-muted-foreground hover:text-foreground">
                        Continuar editando
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
