"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react" // Removed unused icons
import { CreateUserDialog } from "./create-user-dialog" // Keep this or reuse AccountUsers logic?
// Reusing logic from AccountUsers seems better to avoid duplication, but AccountUsers is a big component.
// Let's implement a lighter view here specific for this tab: "Usuarios clientes vinculados a esse workspace"
import { useWorkspace } from "@/context/workspace-context"
import { getAccountUsers, AccountUser } from "@/app/dashboard/account/account-actions"

export function CollaboratorsList() {
    const { activeWorkspace } = useWorkspace()
    const [users, setUsers] = useState<AccountUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!activeWorkspace) return
        loadUsers()
    }, [activeWorkspace])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const allUsers = await getAccountUsers()
            // Filter: Users attached to THIS workspace AND role is 'client' (or 'finance_client'?)
            // User request: "lista somente os usuarios clientes vinculados a esse workspace"

            const workspaceUsers = allUsers.filter(u =>
                u.workspaces.some(w => w.id === activeWorkspace?.id) &&
                (u.role === 'client' || u.workspaces.find(w => w.id === activeWorkspace?.id)?.role === 'client')
                // Logic: Check global role or specific workspace role? 
                // AccountUser type has global role + per workspace role.
                // Let's check the specific workspace role.
            )
            setUsers(workspaceUsers)
        } catch (error) {
            console.error("Failed to load users", error)
        } finally {
            setLoading(false)
        }
    }

    if (!activeWorkspace) return null

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Clientes do Workspace</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Usuários com acesso restrito a este ambiente.
                    </p>
                </div>
                {/* Remove CreateUserDialog if this is just a view or add relevant "Invite Client" action */}
            </div>

            <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm divide-y divide-border/40 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum cliente vinculado a este workspace.
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.userId} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {user.name || "Sem nome"}
                                        {user.status === 'pending' && (
                                            <Badge variant="outline" className="text-[10px] h-4 text-orange-600 bg-orange-50 border-orange-200">
                                                Pendente
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 capitalize">
                                    Cliente
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
