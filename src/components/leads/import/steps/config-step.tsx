"use client"

import { useEffect, useState } from "react"
import { ImportConfig, getWorkspaceProjects, createProjectInline } from "@/actions/import-leads"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Check } from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { toast } from "sonner"

interface ConfigStepProps {
    config: ImportConfig
    setConfig: React.Dispatch<React.SetStateAction<ImportConfig>>
}

export function ConfigStep({ config, setConfig }: ConfigStepProps) {
    const { activeWorkspace } = useWorkspace()
    const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
    const [tagInput, setTagInput] = useState("")
    
    // Project creation state
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [newProjectName, setNewProjectName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

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

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            toast.error("Digite um nome para o projeto")
            return
        }
        if (!activeWorkspace) return

        setIsCreating(true)
        try {
            const res = await createProjectInline(activeWorkspace.id, newProjectName.trim())
            if (res.success && res.project) {
                setProjects(prev => [res.project!, ...prev])
                setConfig(prev => ({ ...prev, projectId: res.project!.id }))
                setIsCreatingProject(false)
                setNewProjectName("")
                toast.success("Projeto criado com sucesso!")
            } else {
                toast.error(res.error || "Erro ao criar projeto")
            }
        } catch (error) {
            toast.error("Erro inesperado ao criar projeto")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="flex flex-col h-full space-y-6 pt-4 px-1">
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="project">Funil / Projeto de Destino *</Label>
                        {!isCreatingProject && (
                            <Button variant="ghost" size="sm" onClick={() => setIsCreatingProject(true)} className="h-6 px-2 text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Criar Novo
                            </Button>
                        )}
                    </div>
                    
                    {isCreatingProject ? (
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Nome do novo projeto" 
                                value={newProjectName}
                                onChange={e => setNewProjectName(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                                disabled={isCreating}
                            />
                            <Button 
                                size="icon" 
                                onClick={handleCreateProject} 
                                disabled={isCreating}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setIsCreatingProject(false)}
                                disabled={isCreating}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
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
                    )}
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
