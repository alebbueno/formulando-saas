"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, ExternalLink, History } from "lucide-react"
import Link from "next/link"

export function AccountFinancial() {
    return (
        <div className="grid gap-6">
            {/* Current Plan Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Plano Atual</CardTitle>
                    <CardDescription>
                        Detalhes da sua assinatura e ciclo de cobrança.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                            <p className="font-medium">Plano Gratuito</p>
                            <p className="text-sm text-muted-foreground">0/3 workspaces</p>
                        </div>
                        <Badge variant="secondary">Ativo</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>Seu plano atual é limitado. Faça upgrade para desbloquear mais recursos.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                        Renova em: <strong>Nunca</strong>
                    </div>
                    <Link href="/dashboard/plans">
                        <Button>
                            Contratar Plano <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>

            {/* Payment History Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Histórico de Faturas</CardTitle>
                            <CardDescription>
                                Visualize e baixe suas faturas anteriores.
                            </CardDescription>
                        </div>
                        <History className="h-5 w-5 text-muted-foreground" />
                    </div>

                </CardHeader>
                <CardContent>
                    {/* Empty State for History */}
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">Nenhuma fatura encontrada</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Como você está no plano gratuito, não há histórico de cobranças.
                        </p>
                    </div>

                    {/* Example Table (Hidden for empty state, but structure ready) 
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow>
                                <TableCell>14/01/2026</TableCell>
                                <TableCell>R$ 0,00</TableCell>
                                <TableCell><Badge variant="outline">Pago</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    */}
                </CardContent>
            </Card>
        </div>
    )
}
