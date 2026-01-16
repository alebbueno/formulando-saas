"use client"

import Link from "next/link"
import { login } from "@/app/auth/actions"
import { useActionState } from "react"
import Image from "next/image"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitButton } from "@/components/auth/submit-button"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null)

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
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription>
                            Digite suas credenciais para acessar sua conta
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
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-purple-600 hover:text-purple-700 hover:underline underline-offset-4"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-white/50 focus:bg-white transition-colors"
                                />
                            </div>
                            <SubmitButton className="w-full bg-purple-600 hover:bg-purple-700 text-white" loadingText="Entrando...">
                                Entrar
                            </SubmitButton>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500 rounded-full border border-gray-100">Ou</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200">
                            Entrar com Link Mágico
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 text-center pt-2 pb-6">
                        <div className="text-sm text-gray-500">
                            Não tem uma conta?{" "}
                            <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium hover:underline underline-offset-4">
                                Crie agora
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
