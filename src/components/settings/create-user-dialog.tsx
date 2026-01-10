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
import { UserPlus, Lock, Mail, User } from "lucide-react"

export function CreateUserDialog() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("editor")

    const handleCreate = () => {
        // Mock create action
        console.log("Creating user", { name, email, password, role })
        setOpen(false)
        setEmail("")
        setName("")
        setPassword("")
        setRole("editor")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Crie uma conta de acesso direto para um colaborador.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <div className="col-span-3 relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="Nome completo"
                                className="pl-9"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <div className="col-span-3 relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                placeholder="usuario@exemplo.com"
                                className="pl-9"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Senha
                        </Label>
                        <div className="col-span-3 relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-9"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <SelectContent className="z-[10000]">
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Visualizador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreate}>Criar Conta</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
