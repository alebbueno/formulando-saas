"use client"

import Link from "next/link"
import { login } from "@/app/auth/actions"
import { useActionState } from "react"

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
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Entrar no Formulando
                    </CardTitle>
                    <CardDescription className="text-center">
                        Digite suas credenciais para acessar sua conta
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
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary underline-offset-4 hover:underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <SubmitButton className="w-full" loadingText="Entrando...">
                            Entrar
                        </SubmitButton>
                    </form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full">
                        Entrar com Link Mágico
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center">
                    <div className="text-sm text-muted-foreground">
                        Não tem uma conta?{" "}
                        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                            Crie agora
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
