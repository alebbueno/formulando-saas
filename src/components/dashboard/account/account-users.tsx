"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getAccountUsers, AccountUser, inviteAccountUser, updateAccountUser, deleteAccountUser } from "@/app/dashboard/account/account-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users as UsersIcon, Mail, Shield, Building2, Pencil, Trash2, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useWorkspace } from "@/context/workspace-context"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner" // Assuming sonner is installed or will use basic alert

export function AccountUsers() {
    const [users, setUsers] = useState<AccountUser[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const { workspaces } = useWorkspace()

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("member")
    const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([])

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await getAccountUsers()
            setUsers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!email) return

        // Validation: Client must have exactly 1 workspace
        if (role === 'client' && selectedWorkspaces.length !== 1) {
            toast.error("Para clientes, selecione exatamente 1 workspace.")
            return
        }

        if (role === 'member' && selectedWorkspaces.length === 0) {
            toast.error("Selecione ao menos 1 workspace.")
            return
        }

        setActionLoading(true)

        try {
            let result;
            if (editingId) {
                result = await updateAccountUser(editingId, role, selectedWorkspaces)
            } else {
                result = await inviteAccountUser(email, role, selectedWorkspaces)
            }

            if (result.success) {
                toast.success(result.message)
                setDialogOpen(false)
                resetForm()
                fetchUsers()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao processar sua solicitação.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm("Tem certeza que deseja remover este usuário? Ele perderá acesso a todos os workspaces.")) return

        try {
            const result = await deleteAccountUser(userId)
            if (result.success) {
                toast.success(result.message)
                fetchUsers()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Erro ao remover usuário.")
        }
    }

    const openForEdit = (user: AccountUser) => {
        setEditingId(user.userId)
        setEmail(user.email || "")
        // Infer simplified role from first workspace (assuming uniform role assignment for UI simplicity or taking 'member' if mixed)
        // In this simple UI, we assume user has same role across assigned workspaces or we just pick one.
        // The AccountUser type has workspaces[].role.
        // Let's verify if user is 'client' in any workspace, or 'member'.
        // Simplified logic: if user works as client in any workspace, treat as client in UI? Or check logic.
        const userRole = user.workspaces[0]?.role === 'client' ? 'client' : 'member'
        setRole(userRole)
        setSelectedWorkspaces(user.workspaces.map(w => w.id))
        setDialogOpen(true)
    }

    const openForInvite = () => {
        resetForm()
        setDialogOpen(true)
    }

    const resetForm = () => {
        setEditingId(null)
        setEmail("")
        setRole("member")
        setSelectedWorkspaces([])
    }

    const toggleWorkspace = (wsId: string) => {
        if (role === 'client') {
            // Single select behavior for Client
            setSelectedWorkspaces([wsId])
        } else {
            // Multi select behavior for Member
            setSelectedWorkspaces(prev =>
                prev.includes(wsId)
                    ? prev.filter(id => id !== wsId)
                    : [...prev, wsId]
            )
        }
    }

    // Effect to clear selection when role changes to enforce logic
    useEffect(() => {
        setSelectedWorkspaces([])
    }, [role])

    return (
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Equipe e Clientes</CardTitle>
                    <CardDescription className="text-base">
                        Gerencie o acesso aos seus workspaces. Convide membros ou dê acesso restrito a clientes.
                    </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={openForInvite}>
                            <Plus className="w-4 h-4" />
                            Convidar Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Editar Usuário" : "Convidar Usuário"}</DialogTitle>
                            <DialogDescription>
                                Envie um convite por e-mail para dar acesso à plataforma.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium">E-mail do usuário</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        className="pl-9"
                                        placeholder="exemplo@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!!editingId} // Disable email edit
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role" className="text-sm font-medium">Nível de Acesso</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o nível de acesso..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
                                        <SelectItem value="member">Membro / Colaborador</SelectItem>
                                        <SelectItem value="client">Cliente Final</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {role === 'member'
                                        ? '👥 Pode acessar e editar múltiplos workspaces.'
                                        : '🏢 Acesso restrito a apenas um workspace específico.'}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">
                                    {role === 'client' ? 'Vincular a qual workspace?' : 'Quais workspaces terá acesso?'}
                                </Label>
                                <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto bg-muted/5">
                                    {workspaces.map((ws) => {
                                        const isSelected = selectedWorkspaces.includes(ws.id)
                                        return (
                                            <div
                                                key={ws.id}
                                                className={`flex items-center space-x-3 p-3 transition-colors hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                                                onClick={() => toggleWorkspace(ws.id)}
                                            >
                                                <Checkbox
                                                    id={ws.id}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleWorkspace(ws.id)}
                                                    className="pointer-events-none" // Handle click on container
                                                />
                                                <div className="flex-1">
                                                    <Label htmlFor={ws.id} className="text-sm font-medium cursor-pointer pointer-events-none">
                                                        {ws.name}
                                                    </Label>
                                                </div>
                                                {isSelected && <Badge variant="secondary" className="text-[10px] h-5">Selecionado</Badge>}
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {role === 'client'
                                        ? "⚠️ Clientes só podem ser vinculados a um único projeto/marca por vez."
                                        : "ℹ️ Você pode selecionar quantos projetos quiser."}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={actionLoading}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={!email || selectedWorkspaces.length === 0 || actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingId ? "Salvar Alterações" : "Enviar Convite"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[350px]">Usuário</TableHead>
                                <TableHead className="w-[150px]">Função</TableHead>
                                <TableHead>Workspaces Vinculados</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Carregando usuários...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <UsersIcon className="h-6 w-6 opacity-50" />
                                            </div>
                                            <p className="font-medium text-foreground">Sua equipe está vazia</p>
                                            <p className="text-sm max-w-sm mt-1 mb-4">Adicione colaboradores ou clientes para compartilharem o acesso aos seus projetos.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.userId} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarFallback className={cn("text-primary", user.status === 'pending' && "bg-orange-100 text-orange-600 border-orange-200")}>
                                                        {user.name?.[0] || user.email?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{user.name}</span>
                                                        {user.status === 'pending' && (
                                                            <Badge variant="outline" className="h-4 text-[10px] px-1 bg-orange-50 text-orange-600 border-orange-200">
                                                                Pendente
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'owner' ? "default" : "outline"} className={user.role === 'client' ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : ""}>
                                                {user.role === 'owner' ? 'Admin' : user.role === 'member' ? 'Colaborador' : 'Cliente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.workspaces.map(ws => (
                                                    <Badge key={ws.id} variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground border-transparent">
                                                        {ws.name}
                                                    </Badge>
                                                ))}
                                                {user.workspaces.length === 0 && <span className="text-xs text-muted-foreground italic">Nenhum vínculo</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.role !== 'owner' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => openForEdit(user)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(user.userId)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
