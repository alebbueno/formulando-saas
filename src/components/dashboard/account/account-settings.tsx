"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Bell, Globe, Shield, Key, Download, BookOpen, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

interface AccountSettingsProps {
    userEmail?: string | null
    userName?: string | null
    userAvatar?: string | null
}

export function AccountSettings({ userEmail, userName, userAvatar }: AccountSettingsProps) {
    const [activeTab, setActiveTab] = useState("profile")
    const { setTheme, theme } = useTheme()

    // Form States
    const [name, setName] = useState(userName || "")
    const [email, setEmail] = useState(userEmail || "")
    const [language, setLanguage] = useState("pt-BR")
    const [marketingEmails, setMarketingEmails] = useState(true)
    const [securityEmails, setSecurityEmails] = useState(true)

    const handleSaveProfile = () => {
        // Mock save
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Atualizando perfil...',
                success: 'Perfil atualizado com sucesso!',
                error: 'Erro ao atualizar perfil',
            }
        )
    }

    const menuItems = [
        { id: "profile", label: "Perfil", icon: User },
        { id: "security", label: "Segurança", icon: Lock },
        { id: "preferences", label: "Preferências", icon: Globe },
        { id: "notifications", label: "Notificações", icon: Bell },
        { id: "integrations", label: "Integrações", icon: Key },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:min-h-[600px]">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 flex-shrink-0">
                <div className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                        <div>
                            <h3 className="text-lg font-medium">Perfil</h3>
                            <p className="text-sm text-muted-foreground">
                                Gerencie suas informações pessoais e como elas aparecem para outros.
                            </p>
                        </div>
                        <Separator />

                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Avatar</CardTitle>
                                    <CardDescription>Esta é sua imagem de perfil pública.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={userAvatar || ""} />
                                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                            {name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <Button variant="outline" size="sm">Trocar imagem</Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, GIF ou PNG. Máximo de 2MB.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Básicas</CardTitle>
                                    <CardDescription>Atualize seu nome e outras informações de identificação.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={email} disabled className="bg-muted" />
                                        <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                        <div>
                            <h3 className="text-lg font-medium">Segurança</h3>
                            <p className="text-sm text-muted-foreground">
                                Mantenha sua conta segura alterando sua senha e configurações de acesso.
                            </p>
                        </div>
                        <Separator />

                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alterar Senha</CardTitle>
                                    <CardDescription>Para sua segurança, não compartilhe sua senha com ninguém.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current-password">Senha Atual</Label>
                                        <Input id="current-password" type="password" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-password">Nova Senha</Label>
                                        <Input id="new-password" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline">Atualizar Senha</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
                                    <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-medium">2FA está desativado</p>
                                            <p className="text-sm text-muted-foreground">Proteja sua conta com um código de verificação.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" disabled>Configurar</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "preferences" && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                        <div>
                            <h3 className="text-lg font-medium">Preferências</h3>
                            <p className="text-sm text-muted-foreground">
                                Personalize sua experiência na plataforma.
                            </p>
                        </div>
                        <Separator />

                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aparência</CardTitle>
                                    <CardDescription>Escolha como o formulando deve parecer para você.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Tema Escuro</Label>
                                            <p className="text-sm text-muted-foreground">Habilitar modo escuro para a interface.</p>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Idioma</CardTitle>
                                    <CardDescription>Selecione seu idioma preferido.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 max-w-xs">
                                        <Label>Idioma da Interface</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        >
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="en-US">English (US)</option>
                                            <option value="es">Español</option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                        <div>
                            <h3 className="text-lg font-medium">Notificações</h3>
                            <p className="text-sm text-muted-foreground">
                                Decida como e quando você quer ser notificado.
                            </p>
                        </div>
                        <Separator />

                        <Card>
                            <CardHeader>
                                <CardTitle>Preferências de Email</CardTitle>
                                <CardDescription>Gerencie quais emails você recebe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Emails de Segurança</Label>
                                        <p className="text-sm text-muted-foreground">Alertas sobre login e atividades suspeitas.</p>
                                    </div>
                                    <Switch
                                        checked={securityEmails}
                                        onCheckedChange={setSecurityEmails}
                                        disabled
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Novidades e Marketing</Label>
                                        <p className="text-sm text-muted-foreground">Receba dicas, novidades e ofertas.</p>
                                    </div>
                                    <Switch
                                        checked={marketingEmails}
                                        onCheckedChange={setMarketingEmails}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "integrations" && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                        <div>
                            <h3 className="text-lg font-medium">Integrações e API</h3>
                            <p className="text-sm text-muted-foreground">
                                Gerencie chaves de acesso para uso externo.
                            </p>
                        </div>
                        <Separator />

                        <Card>
                            <CardHeader>
                                <CardTitle>Chaves de API</CardTitle>
                                <CardDescription>Use estas chaves para autenticar suas requisições.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
                                    <Key className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                                    <p className="font-medium">Você ainda não gerou nenhuma chave de API</p>
                                    <p className="text-sm text-muted-foreground mb-4">Crie uma chave para acessar nossa API programaticamente.</p>
                                    <Button variant="outline">Gerar Nova Chave</Button>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                )}
            </div>
        </div>
    )
}
