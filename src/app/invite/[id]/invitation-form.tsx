"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { acceptInvitation } from "@/actions/invitations"
import { useRouter } from "next/navigation"

export function InvitationForm({ invitation }: { invitation: any }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        confirmPassword: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("As senhas não coincidem")
            return
        }

        if (!formData.name.trim()) {
            toast.error("Por favor, digite seu nome")
            return
        }

        setIsLoading(true)

        try {
            const result = await acceptInvitation({
                invitationId: invitation.id,
                name: formData.name,
                password: formData.password,
                isExistingUser: false // For MVP, assuming new user or they would just login
            })

            if (!result.success) {
                toast.error(result.error)
                return
            }

            toast.success("Conta criada e convite aceito!")
            router.push("/dashboard")
        } catch (error) {
            toast.error("Ocorreu um erro ao processar seu cadastro")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    value={invitation.email}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Criar Senha</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    required
                    minLength={6}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="******"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                    required
                    minLength={6}
                />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                    </>
                ) : (
                    <>
                        Aceitar e Criar Conta
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
            >
                Já tenho uma conta
            </Button>
        </form>
    )
}
