"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Check } from "lucide-react"

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
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useWorkspace } from "@/context/workspace-context"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { PLANS } from "@/config/plans"
import { checkTrialEligibility, createWorkspaceWithCheckout } from "@/actions/subscription"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    slug: z.string().min(3, {
        message: "O identificador deve ter pelo menos 3 caracteres.",
    }).regex(/^[a-z0-9-]+$/, {
        message: "O identificador deve conter apenas letras minúsculas, números e hífens.",
    }),
    planSlug: z.enum(["growth", "scale", "agency-pro"]),
    useTrial: z.boolean()
})

interface CreateBrandDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateBrandDialog({ open, onOpenChange }: CreateBrandDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [eligibleForTrial, setEligibleForTrial] = useState(false)
    const { refreshWorkspaces } = useWorkspace()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            planSlug: "growth",
            useTrial: false
        },
    })

    // Check trial eligibility when dialog opens
    useEffect(() => {
        if (open) {
            checkTrialEligibility().then(isEligible => {
                setEligibleForTrial(isEligible)
                if (isEligible) {
                    form.setValue('useTrial', true)
                }
            })
        }
    }, [open, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)

            const result = await createWorkspaceWithCheckout({
                name: values.name,
                slug: values.slug,
                planSlug: values.planSlug,
                useTrial: values.useTrial
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.checkoutUrl) {
                // Redirect to Stripe
                window.location.href = result.checkoutUrl
                return
            }

            // Should not happen in new flow, but if success without checkout:
            toast.success("Workspace criado!")
            await refreshWorkspaces()
            onOpenChange(false)
            form.reset()

        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao criar o workspace.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Novo Workspace</DialogTitle>
                    <DialogDescription>
                        Cada workspace representa um projeto ou cliente com faturamento separado.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Workspace</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Cliente X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Identificador (URL)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cliente-x" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="planSlug"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Escolha o Plano</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 gap-4"
                                        >
                                            {Object.values(PLANS).map((plan) => (
                                                <FormItem key={plan.slug}>
                                                    <FormControl>
                                                        <RadioGroupItem value={plan.slug} className="sr-only" />
                                                    </FormControl>
                                                    <FormLabel className={cn(
                                                        "flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                        field.value === plan.slug && "border-primary bg-primary/5"
                                                    )}>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium leading-none">
                                                                {plan.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {plan.limits.leads === 999999 ? "Leads Ilimitados" : `${plan.limits.leads.toLocaleString()} leads`} • {plan.limits.emails.toLocaleString()} emails
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">R$ {plan.price}/mês</span>
                                                            {field.value === plan.slug && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {eligibleForTrial ? (
                            <FormField
                                control={form.control}
                                name="useTrial"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Iniciar Teste Grátis
                                            </FormLabel>
                                            <FormDescription>
                                                Experimente por 7 dias sem cobrança.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm text-yellow-600">
                                Você já utilizou seu teste grátis nesta conta. A cobrança será iniciada imediatamente.
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.watch('useTrial') ? 'Iniciar Trial' : 'Ir para Pagamento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
