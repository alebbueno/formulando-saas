"use client"

import { updatePassword } from "@/app/auth/actions"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitButton } from "@/components/auth/submit-button"

export default function UpdatePasswordPage() {
    const [state, formAction] = useActionState(updatePassword, null)

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Nova Senha
                    </CardTitle>
                    <CardDescription className="text-center">
                        Digite sua nova senha abaixo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state?.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                        </div>
                        <SubmitButton className="w-full" loadingText="Atualizando...">
                            Atualizar Senha
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
