"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash, UserCog } from "lucide-react"
import { CreateUserDialog } from "./create-user-dialog"


interface Collaborator {
    id: string
    name: string
    email: string
    role: 'admin' | 'editor' | 'viewer'
    status: 'active' | 'pending'
    avatarUrl?: string
}

const MOCK_COLLABORATORS: Collaborator[] = [
    {
        id: "1",
        name: "Alessandro",
        email: "alessandro@example.com",
        role: "admin",
        status: "active",
        avatarUrl: "https://github.com/shadcn.png"
    },
    {
        id: "2",
        name: "Maria Silva",
        email: "maria@example.com",
        role: "editor",
        status: "active"
    },
    {
        id: "3",
        name: "João Pending",
        email: "joao@example.com",
        role: "viewer",
        status: "pending"
    }
]

export function CollaboratorsList() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Membros do Workspace</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie quem tem acesso e suas permissões.
                    </p>
                </div>
                <div className="flex gap-2">
                    <CreateUserDialog />
                </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm divide-y divide-border/40 overflow-hidden shadow-sm">
                {MOCK_COLLABORATORS.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {user.name}
                                    {user.id === "1" && <Badge variant="secondary" className="text-xs">Você</Badge>}
                                </div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="capitalize">
                                    {user.role}
                                </Badge>
                                {user.status === 'pending' && (
                                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                        Pendente
                                    </span>
                                )}
                            </div>

                            {user.id !== "1" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Ações</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <UserCog className="mr-2 h-4 w-4" />
                                            Alterar função
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Trash className="mr-2 h-4 w-4" />
                                            Remover
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
