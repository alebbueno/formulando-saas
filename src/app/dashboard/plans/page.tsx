"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star, Zap, ShieldCheck, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PlansPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
            <div className="w-full max-w-6xl space-y-8">
                <Link href="/dashboard/account">
                    <Button variant="ghost" className="gap-2 mb-4">
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                </Link>

                <div className="space-y-12 pb-10">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">Escolha o plano ideal para sua agência</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Escale sua operação com ferramentas completas de captação, automação e gestão de múltiplos clientes.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Growth Plan */}
                        <Card className="flex flex-col relative overflow-hidden transition-all hover:border-primary/50">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 dark:bg-blue-900/20">
                                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-xl text-blue-600 dark:text-blue-400">Growth</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold">R$ 249</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                                <CardDescription className="mt-2">
                                    Para agências que estão estruturando sua operação.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Até 3 workspaces
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Formulários ilimitados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Até 10 landing pages
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Até 5.000 leads
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Funil de vendas completo
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Branding removido
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Iniciar teste grátis</Button>
                            </CardFooter>
                        </Card>

                        {/* Scale Plan (Highlighted) */}
                        <Card className="flex flex-col relative border-purple-500 shadow-lg scale-105 z-10">
                            <div className="absolute top-0 right-0 p-0">
                                <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    MAIS POPULAR
                                </div>
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 dark:bg-purple-900/20">
                                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400 fill-current" />
                                </div>
                                <CardTitle className="text-xl text-purple-600 dark:text-purple-400">Scale</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-bold">R$ 549</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                                <CardDescription className="mt-2">
                                    Para agências em crescimento que atendem múltiplos clientes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-3 text-sm font-medium">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> <strong>Até 10 workspaces</strong>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Landing pages ilimitadas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Até 25.000 leads
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Automações ilimitadas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Domínio próprio
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" /> White-label parcial
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Começar teste grátis de 7 dias</Button>
                            </CardFooter>
                        </Card>

                        {/* Agency Pro Plan */}
                        <Card className="flex flex-col relative overflow-hidden transition-all hover:border-primary/50">
                            <CardHeader>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 dark:bg-orange-900/20">
                                    <ShieldCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <CardTitle className="text-xl text-orange-600 dark:text-orange-400">Agency Pro</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold">R$ 899</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                                <CardDescription className="mt-2">
                                    Infraestrutura completa de captação para agências maduras.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Workspaces ilimitados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Leads ilimitados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> White-label completo
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Multi-domínio
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Permissões por usuário
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" /> Suporte prioritário máximo
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Iniciar teste grátis</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Comparison Table */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-center">Comparativo de Recursos</h3>
                        <div className="rounded-md border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Recurso</TableHead>
                                        <TableHead className="text-center">Growth</TableHead>
                                        <TableHead className="text-center font-bold text-purple-600">Scale</TableHead>
                                        <TableHead className="text-center">Agency Pro</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Workspaces (Clientes)</TableCell>
                                        <TableCell className="text-center">3</TableCell>
                                        <TableCell className="text-center font-bold bg-purple-50/50 dark:bg-purple-900/10">10</TableCell>
                                        <TableCell className="text-center">Ilimitado</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Leads mensais</TableCell>
                                        <TableCell className="text-center">5.000</TableCell>
                                        <TableCell className="text-center font-bold bg-purple-50/50 dark:bg-purple-900/10">25.000</TableCell>
                                        <TableCell className="text-center">Ilimitado</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Emails</TableCell>
                                        <TableCell className="text-center">2.000/mês</TableCell>
                                        <TableCell className="text-center font-bold bg-purple-50/50 dark:bg-purple-900/10">10.000/mês</TableCell>
                                        <TableCell className="text-center">30.000/mês</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">IA de Qualificação</TableCell>
                                        <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                        <TableCell className="text-center bg-purple-50/50 dark:bg-purple-900/10"><Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Avançada</Badge></TableCell>
                                        <TableCell className="text-center"><Badge variant="secondary">Estendida</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">White-label</TableCell>
                                        <TableCell className="text-center text-muted-foreground"><X className="h-4 w-4 mx-auto" /></TableCell>
                                        <TableCell className="text-center bg-purple-50/50 dark:bg-purple-900/10">Parcial</TableCell>
                                        <TableCell className="text-center">Completo</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Value Props & Trial */}
                    <div className="grid gap-8 md:grid-cols-2 mt-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Por que escolher nossa plataforma?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="font-medium">Mais barato que RD Station</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/20">
                                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium">Tudo em um único lugar</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/20">
                                        <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="font-medium">Pensado exclusivamente para agências</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/20">
                                        <Check className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="font-medium">Sem curva de aprendizado complexa</span>
                                </li>
                            </ul>
                        </div>

                        <Card className="bg-primary text-primary-foreground border-none flex flex-col justify-center text-center p-6 bg-gradient-to-br from-primary to-primary/80">
                            <CardHeader>
                                <CardTitle className="text-3xl text-white">Teste grátis por 7 dias</CardTitle>
                                <CardDescription className="text-primary-foreground/90 text-lg">
                                    Sem cartão de crédito. Cancele quando quiser.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-6 opacity-90">Junte-se a centenas de agências modernizando sua captação.</p>
                                <Button size="lg" variant="secondary" className="w-full text-lg font-bold h-12 text-primary">
                                    Começar agora
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
