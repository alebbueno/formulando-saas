"use client"

import Link from "next/link"
import { forgotPassword } from "@/app/auth/actions"
import { useActionState } from "react"
import Image from "next/image"

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
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden px-4">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center gap-2 group">
                    <div className="w-10 h-10 flex items-center justify-center transition-all group-hover:scale-110">
                        <Image
                            src="/icon-formulando.svg"
                            alt="Formulando"
                            width={40}
                            height={40}
                            className="w-full h-full"
                        />
                    </div>
                    <span className="text-2xl font-bold font-brand" style={{ color: '#8831d2' }}>
                        formulando.
                    </span>
                </Link>

                <Card className="w-full border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Recuperar Senha
                        </CardTitle>
                        <CardDescription>
                            Digite seu email para receber um link de redefinição
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {state?.error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                        {state?.success && (
                            <Alert className="mb-4 border-green-500 text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertTitle>Email enviado</AlertTitle>
                                <AlertDescription>{state.success}</AlertDescription>
                            </Alert>
                        )}

                        <form action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    className="bg-white/50 focus:bg-white transition-colors"
                                />
                            </div>
                            <SubmitButton className="w-full bg-purple-600 hover:bg-purple-700 text-white" loadingText="Enviando...">
                                Enviar Link
                            </SubmitButton>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <Link href="/login">
                            <Button variant="link" className="gap-2 text-gray-500 hover:text-purple-600">
                                <ChevronLeft className="h-4 w-4" />
                                Voltar para o Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
