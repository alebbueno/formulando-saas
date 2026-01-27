"use client"

import { FileText, ArrowDown, Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LeadsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 border-2 border-dashed rounded-xl bg-muted/10 animate-in fade-in duration-500">
            <div className="relative mb-6">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Users className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-background rounded-full border shadow flex items-center justify-center text-muted-foreground">
                    <ArrowDown className="h-4 w-4" />
                </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight mb-2">
                Seu funil de vendas está esperando!
            </h3>
            <p className="text-muted-foreground max-w-md mb-8">
                Assim que seus clientes responderem aos formulários, eles aparecerão aqui como cards para você gerenciar.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 max-w-lg w-full">
                <div className="flex flex-col items-center p-4 bg-card border rounded-lg shadow-sm">
                    <Share2 className="h-8 w-8 text-blue-500 mb-2" />
                    <h4 className="font-semibold mb-1">1. Compartilhe</h4>
                    <p className="text-xs text-muted-foreground">
                        Divulgue o link do seu formulário
                    </p>
                </div>
                <div className="flex flex-col items-center p-4 bg-card border rounded-lg shadow-sm">
                    <FileText className="h-8 w-8 text-green-500 mb-2" />
                    <h4 className="font-semibold mb-1">2. Receba</h4>
                    <p className="text-xs text-muted-foreground">
                        Os dados chegam aqui automaticamente
                    </p>
                </div>
            </div>

            <div className="mt-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-card border rounded-lg p-4 flex items-center gap-4 max-w-lg text-left">
                    <div className="h-10 w-10 shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Share2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">Dica Pro: Automação com IA</h4>
                        <p className="text-xs text-muted-foreground">
                            Você pode configurar o Formulando para qualificar leads e enviar respostas automáticas assim que eles chegarem.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0 text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50">
                        <Link href="/dashboard/automations">
                            Configurar
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        Voltar para Dashboard e ver Formulários
                    </Link>
                </Button>
            </div>
        </div>
    )
}
