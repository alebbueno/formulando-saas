"use client"

import { useState } from "react"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
    MoreHorizontal, 
    RefreshCw, 
    Trash2, 
    ExternalLink, 
    ShieldCheck, 
    Clock, 
    AlertCircle,
    Star,
    Globe
} from "lucide-react"
import { verifyDomain, deleteDomain, setDefaultDomain } from "@/actions/domain-actions"
import { toast } from "sonner"
import { DNSConfigModal } from "@/components/dashboard/domains/dns-config-modal"

interface DomainListProps {
    domains: any[]
    isLoading: boolean
    onRefresh: () => void
}

export function DomainList({ domains, isLoading, onRefresh }: DomainListProps) {
    const [isVerifying, setIsVerifying] = useState<string | null>(null)
    const [selectedDomain, setSelectedDomain] = useState<any | null>(null)

    const handleVerify = async (id: string) => {
        setIsVerifying(id)
        const result = await verifyDomain(id)
        if (result.success) {
            if (result.verified) {
                toast.success("Domínio verificado com sucesso!")
            } else {
                toast.info(`Status: ${result.status}. Certifique-se de que os DNS estão configurados.`)
            }
            onRefresh()
        } else {
            toast.error(result.error || "Erro ao verificar domínio.")
        }
        setIsVerifying(null)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o domínio ${name}?`)) return
        
        const result = await deleteDomain(id)
        if (result.success) {
            toast.success("Domínio removido.")
            onRefresh()
        } else {
            toast.error(result.error || "Erro ao excluir domínio.")
        }
    }

    const handleSetDefault = async (id: string, workspaceId: string) => {
        const result = await setDefaultDomain(id, workspaceId)
        if (result.success) {
            toast.success("Domínio definido como padrão.")
            onRefresh()
        } else {
            toast.error(result.error || "Erro ao definir padrão.")
        }
    }

    if (isLoading) {
        return <div className="py-10 text-center text-muted-foreground animate-pulse">Carregando domínios...</div>
    }

    if (domains.length === 0) {
        return (
            <div className="py-10 text-center flex flex-col items-center gap-2">
                <Globe className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum domínio configurado.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Domínio</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verificado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {domains.map((domain) => (
                        <TableRow key={domain.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{domain.domain}</span>
                                    {domain.is_default && (
                                        <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase bg-primary/10 text-primary border-primary/20">
                                            Padrão
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {domain.status === "verified" ? (
                                    <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verificado
                                    </Badge>
                                ) : domain.status === "pending" ? (
                                    <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10">
                                        <Clock className="h-3 w-3" />
                                        Pendente
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Falhou
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {domain.verified_at ? new Date(domain.verified_at).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSelectedDomain(domain)}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Ver Configurações DNS
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleSetDefault(domain.id, domain.workspace_id)}
                                            disabled={domain.status !== "verified" || domain.is_default}
                                        >
                                            <Star className="mr-2 h-4 w-4" />
                                            Tornar Padrão
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleVerify(domain.id)}
                                            disabled={isVerifying === domain.id || domain.status === "verified"}
                                        >
                                            <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying === domain.id ? "animate-spin" : ""}`} />
                                            Verificar Agora
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(domain.id, domain.domain)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedDomain && (
                <DNSConfigModal 
                    isOpen={!!selectedDomain} 
                    onClose={() => setSelectedDomain(null)} 
                    domain={selectedDomain} 
                />
            )}
        </div>
    )
}
