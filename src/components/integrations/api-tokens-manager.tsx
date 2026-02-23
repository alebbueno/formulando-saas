"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { KeyRound, Plus, Trash2, Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { generateApiToken, deleteApiToken } from "@/actions/integrations"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function ApiTokensManager({ workspaceId, initialTokens }: { workspaceId: string, initialTokens: any[] }) {
    const [tokens, setTokens] = useState(initialTokens)
    const [isGenerating, setIsGenerating] = useState(false)
    const [newTokenName, setNewTokenName] = useState("")
    const [generatedToken, setGeneratedToken] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({})

    const handleGenerate = async () => {
        if (!newTokenName.trim()) {
            toast.error("Digite um nome para o token")
            return
        }

        setIsGenerating(true)
        try {
            const result = await generateApiToken(workspaceId, newTokenName)
            setTokens([result, ...tokens])
            setGeneratedToken(result.raw_token)
            setNewTokenName("")
            toast.success("Token gerado com sucesso!")
        } catch (error: any) {
            toast.error(error.message || "Erro ao gerar token")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Copiado para a área de transferência")
    }

    const handleRevoke = async (id: string) => {
        if (!confirm("Tem certeza? Esta ação não pode ser desfeita e os sistemas usando este token pararão de funcionar.")) return

        try {
            await deleteApiToken(id, workspaceId)
            setTokens(tokens.filter(t => t.id !== id))
            toast.success("Token revogado com sucesso")
        } catch (error: any) {
            toast.error(error.message || "Erro ao revogar token")
        }
    }

    const toggleTokenVisibility = (id: string) => {
        setVisibleTokens(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const formatTokenDisplay = (tokenStr: string, id: string) => {
        if (visibleTokens[id]) return tokenStr
        return tokenStr.substring(0, 8) + "•".repeat(24)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-start justify-between">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" />
                        Tokens de API
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Crie tokens para permitir que sistemas externos enviem leads para este workspace.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Novo Token
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Gerar Novo Token</DialogTitle>
                            <DialogDescription>
                                Dê um nome para identificar onde este token será usado. O token só será exibido uma vez.
                            </DialogDescription>
                        </DialogHeader>
                        {!generatedToken ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nome do Token</Label>
                                    <Input
                                        placeholder="Ex: Integração RD Station"
                                        value={newTokenName}
                                        onChange={(e) => setNewTokenName(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted rounded-md border text-center">
                                    <p className="text-sm font-medium mb-2">Copie o seu token agora:</p>
                                    <code className="text-sm break-all font-mono text-primary bg-background p-2 rounded block">
                                        {generatedToken}
                                    </code>
                                </div>
                                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                                    <p><strong>Atenção:</strong> Por motivos de segurança, este token não será exibido novamente. Guarde-o em um local seguro.</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            {!generatedToken ? (
                                <Button onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Gerar Token"}
                                </Button>
                            ) : (
                                <Button onClick={() => {
                                    setIsDialogOpen(false)
                                    setGeneratedToken(null)
                                }}>
                                    Concluir
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {tokens.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        Nenhum token de API gerado ainda.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Token (Parcial)</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Último uso</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">{token.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                                    {formatTokenDisplay(token.token, token.id)}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => toggleTokenVisibility(token.id)}
                                                >
                                                    {visibleTokens[token.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(token.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {token.last_used_at ? format(new Date(token.last_used_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Nunca usado"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRevoke(token.id)}
                                            >
                                                Revogar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
