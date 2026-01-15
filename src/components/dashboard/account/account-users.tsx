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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null)

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

        // Validation: Client roles must have exactly 1 workspace
        // Roles: viewer, billing (and legacy client)
        if (['viewer', 'billing', 'client'].includes(role) && selectedWorkspaces.length !== 1) {
            toast.error("Para usuários clientes, selecione exatamente 1 workspace.")
            return
        }

        if (['admin', 'member'].includes(role) && selectedWorkspaces.length === 0) {
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

    const confirmDelete = async () => {
        console.log("Starting delete process for:", userToDelete)
        if (!userToDelete) {
            console.error("No user to delete")
            return
        }

        try {
            console.log("Calling deleteAccountUser with ID:", userToDelete.userId)
            const result = await deleteAccountUser(userToDelete.userId)
            console.log("Delete result:", result)

            if (result.success) {
                toast.success(result.message)
                fetchUsers()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("Erro ao remover usuário.")
        } finally {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    const handleDeleteClick = (user: AccountUser) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const openForEdit = (user: AccountUser) => {
        setEditingId(user.userId)
        setEmail(user.email || "")
        // Infer simplified role from first workspace
        // Prioritize: admin > member > billing > viewer
        // Since we store granular roles, if we're editing, we should try to match the granular role.
        // Assuming user has uniform roles across workspaces for now.
        const firstRole = user.workspaces[0]?.role || 'viewer'

        let validRole = firstRole
        if (!['admin', 'member', 'viewer', 'billing'].includes(validRole)) {
            // fallback mapping
            if (validRole === 'owner') validRole = 'admin'
            else if (validRole === 'client') validRole = 'viewer'
            else validRole = 'member'
        }

        setRole(validRole)
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
        // Single select behavior for Client roles (viewer, billing)
        if (['viewer', 'billing', 'client'].includes(role)) {
            setSelectedWorkspaces([wsId])
        } else {
            // Multi select behavior for Team (admin, member)
            setSelectedWorkspaces(prev =>
                prev.includes(wsId)
                    ? prev.filter(id => id !== wsId)
                    : [...prev, wsId]
            )
        }
    }

    // Effect to clear selection when role changes to enforce logic


    return (
        <>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <b>{userToDelete?.name || userToDelete?.email}</b>?
                            <br /><br />
                            Ele perderá acesso a todos os workspaces ({userToDelete?.workspaces.length}) aos quais está vinculado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
                                    <Label className="text-sm font-medium">Tipo de Usuário</Label>
                                    <Select
                                        value={['owner', 'admin', 'member'].includes(role) ? 'team' : 'client'}
                                        onValueChange={(val) => {
                                            if (val === 'team') {
                                                setRole('member')
                                                setSelectedWorkspaces([]) // Reset when switching type
                                            } else {
                                                setRole('viewer')
                                                setSelectedWorkspaces([]) // Reset when switching type
                                            }
                                        }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="team">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">Equipe Interna</span>
                                                    <span className="text-xs text-muted-foreground">Colaboradores e Admins</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="client">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">Cliente Externo</span>
                                                    <span className="text-xs text-muted-foreground">Visualização e Financeiro</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Permissão Específica</Label>
                                    <Select value={role} onValueChange={(val) => {
                                        setRole(val)
                                        if (val === 'admin') {
                                            setSelectedWorkspaces(workspaces.map(w => w.id))
                                        } else if (['viewer', 'billing'].includes(val)) {
                                            setSelectedWorkspaces([]) // Clear for single-select roles
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            {(['owner', 'admin', 'member'].includes(role)) ? (
                                                <>
                                                    <SelectItem value="admin">
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">Admin do Workspace</span>
                                                            <span className="text-xs text-muted-foreground">Acesso total ao projeto.</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="member">
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">Colaborador</span>
                                                            <span className="text-xs text-muted-foreground">Pode editar formulários e ver leads.</span>
                                                        </div>
                                                    </SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="viewer">
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">Visitante</span>
                                                            <span className="text-xs text-muted-foreground">Apenas visualização de dashboards.</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="billing">
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">Financeiro</span>
                                                            <span className="text-xs text-muted-foreground">Acesso a faturas e cobranças.</span>
                                                        </div>
                                                    </SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">
                                        {['viewer', 'billing', 'client'].includes(role) ? 'Vincular a qual workspace?' : 'Quais workspaces terá acesso?'}
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
                                                    {user.workspaces.slice(0, 3).map(ws => (
                                                        <Badge key={ws.id} variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground border-transparent">
                                                            {ws.name}
                                                        </Badge>
                                                    ))}
                                                    {user.workspaces.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs font-normal bg-muted/50 text-muted-foreground border-transparent">
                                                            +{user.workspaces.length - 3}
                                                        </Badge>
                                                    )}
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
                                                                onClick={() => handleDeleteClick(user)}
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
        </>
    )
}
