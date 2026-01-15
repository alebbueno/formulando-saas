"use client"

import { ChevronsUpDown, Plus, Check, Building2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/context/workspace-context"
import { useState } from "react"
import { CreateBrandDialog } from "./create-brand-dialog"
import { RenameBrandDialog } from "./rename-brand-dialog"

export function BrandSwitcher() {
    const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        className="w-[200px] justify-between bg-background shadow-sm border border-border/50 hover:bg-accent"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <span className="truncate">
                                {activeWorkspace ? activeWorkspace.name : "Selecione uma marca"}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuLabel>Marcas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {workspaces.map((workspace) => (
                        <DropdownMenuItem
                            key={workspace.id}
                            onSelect={() => switchWorkspace(workspace.id)}
                            className="justify-between"
                        >
                            <span className="truncate">{workspace.name}</span>
                            {activeWorkspace?.id === workspace.id && (
                                <Check className="ml-auto h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {/* Only show Create New if user is not purely a client (has at least one owner/member/admin role OR has no workspaces) */}
                    {(workspaces.length === 0 || workspaces.some(w => ['owner', 'admin', 'member'].includes(w.role))) && (
                        <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Marca
                        </DropdownMenuItem>
                    )}
                    {activeWorkspace?.role === 'owner' && (
                        <DropdownMenuItem onSelect={() => setIsRenameDialogOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Renomear Atual
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateBrandDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />

            <RenameBrandDialog
                open={isRenameDialogOpen}
                onOpenChange={setIsRenameDialogOpen}
                workspace={activeWorkspace}
            />
        </>
    )
}
