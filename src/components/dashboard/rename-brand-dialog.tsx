"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateWorkspaceName } from "@/app/dashboard/actions"
import { useWorkspace } from "@/context/workspace-context"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome da marca deve ter pelo menos 2 caracteres.",
    }),
})

interface RenameBrandDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspace: { id: string, name: string } | null
}

export function RenameBrandDialog({ open, onOpenChange, workspace }: RenameBrandDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { refreshWorkspaces } = useWorkspace()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    // Update default values when workspace changes
    useEffect(() => {
        if (workspace) {
            form.reset({ name: workspace.name })
        }
    }, [workspace, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!workspace) return

        try {
            setIsLoading(true)
            const result = await updateWorkspaceName(workspace.id, values.name)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Marca renomeada com sucesso!")
            await refreshWorkspaces()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao atualizar a marca.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Renomear Marca</DialogTitle>
                    <DialogDescription>
                        Altere o nome da sua marca. Isso será atualizado em todo o painel.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Marca</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome da Marca" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
