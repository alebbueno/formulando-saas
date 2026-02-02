"use client"

import { useEffect, useState } from "react"
import { ImportConfig, getWorkspaceProjects } from "@/actions/import-leads"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"

interface ConfigStepProps {
    config: ImportConfig
    setConfig: React.Dispatch<React.SetStateAction<ImportConfig>>
}

export function ConfigStep({ config, setConfig }: ConfigStepProps) {
    const { activeWorkspace } = useWorkspace()
    const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
    const [tagInput, setTagInput] = useState("")

    useEffect(() => {
        if (activeWorkspace) {
            getWorkspaceProjects(activeWorkspace.id).then(setProjects)
        }
    }, [activeWorkspace])

    const toggleDuplicate = (checked: boolean) => {
        setConfig(prev => ({ ...prev, ignoreDuplicates: checked }))
    }

    const handleProjectChange = (val: string) => {
        setConfig(prev => ({ ...prev, projectId: val }))
    }

    const handleStatusChange = (val: string) => {
        setConfig(prev => ({ ...prev, initialStatus: val }))
    }

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            const newTag = tagInput.trim()
            if (!config.tags.includes(newTag)) {
                setConfig(prev => ({ ...prev, tags: [...prev.tags, newTag] }))
            }
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setConfig(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }))
    }

    return (
        <div className="flex flex-col h-full space-y-6 pt-4 px-1">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="project">Funil / Projeto de Destino *</Label>
                    <Select value={config.projectId} onValueChange={handleProjectChange}>
                        <SelectTrigger id="project">
                            <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Os leads serão associados a este projeto e suas automações.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Etapa Inicial</Label>
                    <Select value={config.initialStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Novo Lead">Novo Lead</SelectItem>
                            <SelectItem value="Qualificado">Qualificado</SelectItem>
                            <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Perdido">Perdido</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md min-h-[40px]">
                        {config.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                            </Badge>
                        ))}
                        <input
                            className="bg-transparent outline-none flex-1 text-sm min-w-[120px]"
                            placeholder="Digite e enter para adicionar..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                    <div className="space-y-0.5">
                        <Label className="text-base">Ignorar Duplicados</Label>
                        <p className="text-sm text-muted-foreground">
                            Não importar se o email já existir neste workspace.
                        </p>
                    </div>
                    <Switch checked={config.ignoreDuplicates} onCheckedChange={toggleDuplicate} />
                </div>
            </div>
        </div>
    )
}
