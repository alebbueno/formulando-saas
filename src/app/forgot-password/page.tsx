"use client"

import Link from "next/link"
import { forgotPassword } from "@/app/auth/actions"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitButton } from "@/components/auth/submit-button"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(forgotPassword, null)

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Recuperar Senha
                    </CardTitle>
                    <CardDescription className="text-center">
                        Digite seu email para receber um link de redefinição
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
                    {state?.success && (
                        <Alert className="mb-4 border-green-500 text-green-700 dark:border-green-500/50 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle>Email enviado</AlertTitle>
                            <AlertDescription>{state.success}</AlertDescription>
                        </Alert>
                    )}

                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                        </div>
                        <SubmitButton className="w-full" loadingText="Enviando...">
                            Enviar Link
                        </SubmitButton>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="link" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Voltar para o Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
