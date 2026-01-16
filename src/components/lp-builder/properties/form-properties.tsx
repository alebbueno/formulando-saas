"use client"

import React, { useEffect, useState } from "react"
import { useLPBuilder } from "../context/lp-builder-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { Project } from "@/types"

export function SidebarFormProperties() {
    const { selectedElement, updateElement, workspaceId } = useLPBuilder()
    const [forms, setForms] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchForms = async () => {
            if (!workspaceId) return

            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch ONLY forms for THIS workspace
                const { data } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("type", 'FORM')
                    .eq("workspace_id", workspaceId)
                    .order("created_at", { ascending: false })

                if (data) setForms(data as Project[])
            }
            setLoading(false)
        }

        if (selectedElement?.type === 'form') {
            fetchForms()
        }
    }, [selectedElement?.type, workspaceId])

    if (selectedElement?.type !== 'form') return null

    const handleFormSelect = (formId: string) => {
        const selectedForm = forms.find(f => f.id === formId)
        updateElement(selectedElement.id, {
            properties: {
                ...selectedElement.properties,
                formId: formId,
                formName: selectedForm?.name
            }
        })
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Configuração do Formulário</h3>
            <div className="space-y-1">
                <Label className="text-xs">Selecione o Formulário</Label>
                <Select
                    value={selectedElement.properties?.formId || ''}
                    onValueChange={handleFormSelect}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {forms.map(form => (
                            <SelectItem key={form.id} value={form.id}>
                                {form.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
