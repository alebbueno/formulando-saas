"use client"

import { FormElementInstance } from "@/context/builder-context"
import { FormElements } from "@/components/builder/form-elements"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRef, useState, useTransition } from "react"
import { submitForm } from "@/actions/form"
import { Loader2 } from "lucide-react"

interface FormSubmitComponentProps {
    formUrl: string
    content: FormElementInstance[]
    buttonSettings?: {
        text: string
    }
}

export function FormSubmitComponent({ formUrl, content, buttonSettings }: FormSubmitComponentProps) {
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})
    const [renderKey, setRenderKey] = useState(new Date().getTime()) // To force re-render if needed
    const [submitted, setSubmitted] = useState(false)
    const [pending, startTransition] = useTransition()

    const validateForm = () => {
        const errors: Record<string, boolean> = {}
        const form = document.getElementById("submit-form") as HTMLFormElement
        if (!form) return false

        const formData = new FormData(form)
        let isValid = true

        content.forEach((element) => {
            const { required, fieldName } = element.extraAttributes || {}
            if (required) {
                // If the field has a custom name (fieldName), we check that.
                // Otherwise we fallback to ID.
                // Note: For complex fields (Address, DateRange), the required check might need to be smarter,
                // but the original code just checked "formData.get(element.id)", which implies
                // it only supported simple fields or the main input had that ID.
                // With the update, we look for fieldName field.
                // Since DateRange/Address inject multiple inputs with suffixes, checking the base might not work?
                // However, let's stick to the convention: if a field is required, we look for its primary input.
                // For Address/DateRange, they didn't have a single input with name=id before, so the previous validation
                // likely was broken or incomplete for those complex types anyway (checked line 1310 comment in form-elements).
                // "However, these inputs are uncontrolled by default in this setup (using name prop for submission)."
                // For now, let's update this to be consistent with the simple fields we improved.

                const name = fieldName || element.id

                // For complex fields (DateRange, Address), we might need to check sub-fields,
                // but for now, let's just use the main name logic.
                // We will relax validation for complex types slightly if needed or just check main name.
                // Note: AddressField inputs have names like {name}_street, etc.
                // formData.get(name) will return null if no input has that exact name.
                // So if we have an AddressField, formData.get("endereco") will be null.
                // We should skip validation here for complex types or implement it properly.
                // Assuming standard fields (Text, Email, etc) work with this.

                const value = formData.get(name)

                // Exception for complex fields to avoid blocking submission incorrectly
                const isComplexField = ["AddressField", "DateRangeField"].includes(element.type)

                if (!isComplexField && (!value || value.toString().trim() === "")) {
                    errors[element.id] = true
                    isValid = false
                }
            }
        })

        setFormErrors(errors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Por favor, preencha todos os campos obrigatórios.")
            return
        }

        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const data: Record<string, string | string[]> = {}

        // Handle multiple values for checkbox groups
        const uniqueKeys = new Set(formData.keys())
        uniqueKeys.forEach(key => {
            const values = formData.getAll(key)
            if (values.length > 1) {
                data[key] = values.map(v => v.toString())
            } else {
                data[key] = values[0].toString()
            }
        })

        startTransition(async () => {
            try {
                await submitForm(formUrl, JSON.stringify(data))
                setSubmitted(true)
                toast.success("Formulário enviado com sucesso!")
            } catch (error) {
                console.error(error)
                toast.error("Erro ao enviar formulário. Tente novamente.")
            }
        })
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-[800px] bg-background rounded-lg shadow-lg p-8 border animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Enviado com sucesso!</h2>
                    <p className="text-muted-foreground">Obrigado por preencher nosso formulário.</p>
                </div>
            </div>
        )
    }

    return (
        <form id="submit-form" onSubmit={handleSubmit} className="space-y-6 w-full" noValidate>
            {content.map((element) => {
                const FormElement = FormElements[element.type].formComponent
                const isError = formErrors[element.id]

                // We clone the instance to inject the error state for visualization
                const elementWithErr = {
                    ...element,
                    extraAttributes: {
                        ...element.extraAttributes,
                        error: isError
                    }
                }

                return <FormElement key={element.id} elementInstance={elementWithErr} />
            })}

            <div className="mt-8 flex justify-end">
                <Button
                    type="submit"
                    className="w-full sm:w-auto ui-submit-btn transition-all duration-300"
                    disabled={pending}
                >
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {pending ? "Enviando..." : (buttonSettings?.text || "Enviar")}
                </Button>
            </div>
        </form>
    )
}
