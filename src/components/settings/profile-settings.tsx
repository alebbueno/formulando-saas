"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Key, Lock, User } from "lucide-react"

export function ProfileSettings() {
    return (
        <div className="space-y-6 max-w-4xl">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Meu Perfil</CardTitle>
                    <CardDescription>
                        Gerencie suas informações pessoais e de segurança.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b border-border/40 pb-8">
                        <div className="relative group cursor-pointer">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="text-4xl">AL</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="space-y-4 flex-1 text-center sm:text-left">
                            <div>
                                <h3 className="text-lg font-medium">Foto de Perfil</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Clique na imagem para alterar. Recomendamos uma imagem quadrada de pelo menos 400x400px.
                                </p>
                            </div>
                            <div className="flex gap-4 justify-center sm:justify-start">
                                <Button variant="outline" size="sm">Remover Foto</Button>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2.5">
                                <Label className="text-sm text-foreground/80">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input defaultValue="Alessandro" className="pl-9 bg-muted/30 border-border/50" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm text-foreground/80">Email</Label>
                                <Input value="alessandro@example.com" disabled className="bg-muted/50 border-border/50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="shadow-lg shadow-primary/20">
                            Salvar Alterações
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Segurança
                    </CardTitle>
                    <CardDescription>
                        Atualize sua senha para manter sua conta segura.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-9 bg-muted/30 border-border/50" />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm text-foreground/80">Confirmar Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-9 bg-muted/30 border-border/50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                            Esqueci minha senha
                        </Button>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary">
                            Atualizar Senha
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
