"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Plus, Mail } from "lucide-react"

export function InviteCollaboratorDialog() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("editor")

    const handleInvite = () => {
        // Mock invite action
        console.log("Inviting", email, "as", role)
        setOpen(false)
        setEmail("")
        setRole("editor")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Convidar Colaborador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Convidar Colaborador</DialogTitle>
                    <DialogDescription>
                        Envie um convite por email para adicionar um novo membro ao seu workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <div className="col-span-3 relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                placeholder="colaborador@exemplo.com"
                                className="pl-9"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Função
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione uma função" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Admin</span>
                                        <span className="text-xs text-muted-foreground">Acesso total ao workspace e configurações</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Editor</span>
                                        <span className="text-xs text-muted-foreground">Pode criar e editar formulários</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="viewer">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Visualizador</span>
                                        <span className="text-xs text-muted-foreground">Apenas visualiza leads e resultados</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleInvite}>Enviar Convite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
