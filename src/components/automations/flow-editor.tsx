"use client"

import { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MiniMap,
    Panel,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Plus, Play, Info } from "lucide-react"
import Link from "next/link"
import { updateAutomationFlow } from "@/actions/automations"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

import { CustomNode } from './custom-node';

// Register Custom Node
const nodeTypes = {
    trigger: CustomNode,
    action_email: CustomNode,
    action_tag: CustomNode,
    action_status: CustomNode,
    action_webhook: CustomNode,
    action_delay: CustomNode,
    condition: CustomNode,
    default: CustomNode
};

interface FlowEditorProps {
    initialData: any
}

export function FlowEditor({ initialData }: FlowEditorProps) {
    // Parse flow_data or set defaults
    const defaultNodes = initialData.flow_data?.nodes || [
        { id: '1', type: 'trigger', position: { x: 50, y: 300 }, data: { label: 'Gatilho: Form Enviado', nodeType: 'trigger' } },
    ];
    const defaultEdges = initialData.flow_data?.edges || [];

    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
    const [isSaving, setIsSaving] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [forms, setForms] = useState<{ id: string, name: string }[]>([])
    const [emailTemplates, setEmailTemplates] = useState<{ id: string, name: string, subject: string }[]>([])
    const [availableFields, setAvailableFields] = useState<{ id: string, label: string, type: string }[]>([])

    // Fetch available forms and email templates on mount
    useEffect(() => {
        import("@/actions/form").then(({ getForms }) => {
            getForms().then((data) => {
                setForms(data || [])
                // Update trigger node with forms
                setNodes((nds) => nds.map((node) => {
                    if (node.type === 'trigger') {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                availableForms: data || []
                            }
                        }
                    }
                    return node
                }))
            })
        })

        // Fetch email templates for the workspace
        import("@/actions/emails").then(({ getEmailTemplates }) => {
            getEmailTemplates(initialData.workspace_id).then((data) => {
                setEmailTemplates(data || [])
            }).catch((error) => {
                console.error("Error fetching email templates:", error)
            })
        })
    }, [setNodes, initialData.workspace_id])

    const onConnect = useCallback(
        (params: Connection) => {
            let label = ''
            if (params.sourceHandle === 'true') label = 'Sim'
            if (params.sourceHandle === 'false') label = 'Não'

            setEdges((eds) => addEdge({ ...params, label, animated: true, style: { stroke: params.sourceHandle === 'false' ? '#ef4444' : '#22c55e' } }, eds))
        },
        [setEdges],
    );

    const onSave = async () => {
        setIsSaving(true)
        try {
            const flowData = { nodes, edges }
            await updateAutomationFlow(initialData.id, flowData)
            toast.success("Fluxo salvo com sucesso!")
        } catch (error) {
            toast.error("Erro ao salvar fluxo")
        } finally {
            setIsSaving(false)
        }
    }

    const onAddNode = (type: string, label: string) => {
        const id = crypto.randomUUID()

        // Find positions for horizontal layout
        // Place new node to the right of the selected node or the last node
        const referenceNode = selectedNode || nodes[nodes.length - 1]
        const refX = referenceNode?.position.x || 0
        const refY = referenceNode?.position.y || 0

        const newNode: Node = {
            id,
            position: { x: refX + 250, y: refY }, // Shift right by 250px
            data: { label, type, nodeType: type },
            type: type, // Use the specific type so it picks up CustomNode from nodeTypes
        };

        setNodes((nds) => nds.concat(newNode));

        // Auto Connect if we have a reference node AND it's not a condition node (force manual selection for branching)
        if (referenceNode && referenceNode.type !== 'condition' && (referenceNode.data as any).nodeType !== 'condition') {
            setEdges((eds) => addEdge({ source: referenceNode.id, target: id, sourceHandle: null, targetHandle: null }, eds))
        }
    }

    const onNodeClick = (_: any, node: Node) => {
        setSelectedNode(node)
    }

    const updateNodeData = (key: string, value: any) => {
        if (!selectedNode) return
        setNodes((nds) => nds.map((node) => {
            if (node.id === selectedNode.id) {
                const newData = { ...node.data, config: { ...node.data.config as any, [key]: value } }
                // Also update label if name changes
                return { ...node, data: newData }
            }
            return node
        }))
        // Update local selected node state too to reflect in UI immediately if needed
        setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, config: { ...prev.data.config as any, [key]: value } } } : null)
    }

    // Fetch fields when condition node is selected
    useEffect(() => {
        if (selectedNode?.type === 'condition' || ((selectedNode?.data as any)?.nodeType === 'condition')) {
            const triggerNode = nodes.find(n => n.type === 'trigger')
            const formId = (triggerNode?.data?.config as any)?.formId

            if (formId) {
                import("@/actions/form").then(({ getFormFields }) => {
                    getFormFields(formId).then(fields => {
                        setAvailableFields(fields || [])
                    })
                })
            } else {
                setAvailableFields([])
            }
        }
    }, [selectedNode?.id, nodes])

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/automations">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <span className="font-semibold">{initialData.name}</span>
                        <span className="text-xs text-muted-foreground uppercase">{initialData.is_active ? 'Ativo' : 'Rascunho'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={onSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Fluxo"}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Canvas */}
                <div className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        fitView
                        attributionPosition="bottom-right"
                        className="bg-slate-50"
                    >
                        <Background color="#ccc" gap={20} variant={BackgroundVariant.Dots} />
                        <Controls />
                        <MiniMap />
                        <Panel position="top-left" className="bg-white/80 p-2 rounded-lg border shadow-sm backdrop-blur">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-muted-foreground px-2">Adicionar Nó</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onAddNode('action_email', 'Enviar Email')} className="text-xs justify-start">
                                        📧 Email
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onAddNode('action_tag', 'Add Tag')} className="text-xs justify-start">
                                        🏷️ Tag
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onAddNode('action_status', 'Mudar Status')} className="text-xs justify-start">
                                        🔄 Status
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onAddNode('action_webhook', 'Webhook')} className="text-xs justify-start">
                                        🔗 Webhook
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onAddNode('condition', 'Condição')} className="text-xs justify-start col-span-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700">
                                        🔀 Decisão (If/Else)
                                    </Button>
                                </div>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Sidebar / Properties Panel */}
                <div className="w-80 border-l bg-background p-4 overflow-y-auto shrink-0">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Propriedades
                    </h3>

                    {selectedNode ? (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>ID do Nó</Label>
                                <Input value={selectedNode.id} disabled className="bg-muted font-mono text-xs" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo</Label>
                                <Input value={selectedNode.data.nodeType as string || selectedNode.type || 'Standard'} disabled className="bg-muted" />
                            </div>

                            {/* Dynamic Config Forms */}
                            {selectedNode.type === 'trigger' && (
                                <div className="grid gap-2">
                                    <Label>Formulário Gatilho</Label>
                                    <Select
                                        value={(selectedNode.data.config as any)?.formId || ''}
                                        onValueChange={(val) => updateNodeData('formId', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um formulário..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {forms.map(form => (
                                                <SelectItem key={form.id} value={form.id}>
                                                    {form.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Se vazio, executa para todos os formulários.
                                    </p>
                                </div>
                            )}

                            {(selectedNode.data.nodeType === 'action_tag') && (
                                <div className="grid gap-2">
                                    <Label>Tags (separadas por vírgula)</Label>
                                    <Input
                                        placeholder="quente, urgente"
                                        value={(selectedNode.data.config as any)?.tags?.join(',') || ''}
                                        onChange={(e) => updateNodeData('tags', e.target.value.split(',').map(s => s.trim()))}
                                    />
                                    <p className="text-xs text-muted-foreground">Ex: cliente, vip</p>
                                </div>
                            )}

                            {(selectedNode.data.nodeType === 'action_status') && (
                                <div className="grid gap-2">
                                    <Label>Novo Status</Label>
                                    <Select
                                        value={(selectedNode.data.config as any)?.status || ''}
                                        onValueChange={(val) => updateNodeData('status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Novo Lead">Novo Lead</SelectItem>
                                            <SelectItem value="Qualificado">Qualificado</SelectItem>
                                            <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                                            <SelectItem value="Ganho">Ganho</SelectItem>
                                            <SelectItem value="Perdido">Perdido</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(selectedNode.data.nodeType === 'action_webhook') && (
                                <div className="grid gap-2">
                                    <Label>URL do Webhook</Label>
                                    <Input
                                        placeholder="https://api.example.com/webhook"
                                        value={(selectedNode.data.config as any)?.url || ''}
                                        onChange={(e) => updateNodeData('url', e.target.value)}
                                    />
                                </div>
                            )}

                            {(selectedNode.data.nodeType === 'action_email') && (
                                <div className="space-y-3">
                                    <div className="grid gap-2">
                                        <Label>Template de Email</Label>
                                        <Select
                                            value={(selectedNode.data.config as any)?.templateId || ''}
                                            onValueChange={(val) => {
                                                const template = emailTemplates.find(t => t.id === val)
                                                updateNodeData('templateId', val)
                                                if (template) {
                                                    updateNodeData('templateName', template.name)
                                                    updateNodeData('templateSubject', template.subject)
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {emailTemplates.length === 0 ? (
                                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                                        Nenhum template criado
                                                    </div>
                                                ) : (
                                                    emailTemplates.map(template => (
                                                        <SelectItem key={template.id} value={template.id}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{template.name}</span>
                                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                    {template.subject}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            O email será enviado para o lead com dados personalizados.
                                        </p>
                                    </div>
                                    {(selectedNode.data.config as any)?.templateSubject && (
                                        <div className="p-3 bg-muted/50 rounded-lg border">
                                            <div className="text-xs font-medium text-muted-foreground mb-1">Assunto:</div>
                                            <div className="text-sm">{(selectedNode.data.config as any).templateSubject}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Condition Node Config */}
                            {(selectedNode.data.nodeType === 'condition') && (
                                <div className="space-y-3">
                                    <div className="grid gap-2">
                                        <Label>Campo do Formulário</Label>
                                        {availableFields.length > 0 ? (
                                            <Select
                                                value={(selectedNode.data.config as any)?.field || ''}
                                                onValueChange={(val) => {
                                                    const field = availableFields.find(f => f.id === val)
                                                    updateNodeData('field', val)
                                                    if (field) {
                                                        updateNodeData('fieldLabel', field.label || field.type)
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um campo..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableFields.map(f => (
                                                        <SelectItem key={f.id} value={f.id}>
                                                            {f.label || f.type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                placeholder="ex: assunto (ou selecione um form)"
                                                value={(selectedNode.data.config as any)?.field || ''}
                                                onChange={(e) => updateNodeData('field', e.target.value)}
                                            />
                                        )}
                                        {availableFields.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground">Selecione um formulário no Gatilho para ver os campos.</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Operador</Label>
                                        <Select
                                            value={(selectedNode.data.config as any)?.operator || 'equals'}
                                            onValueChange={(val) => updateNodeData('operator', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equals">Igual a</SelectItem>
                                                <SelectItem value="not_equals">Diferente de</SelectItem>
                                                <SelectItem value="contains">Contém</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Valor</Label>
                                        <Input
                                            placeholder="ex: suporte"
                                            value={(selectedNode.data.config as any)?.value || ''}
                                            onChange={(e) => updateNodeData('value', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            Selecione um nó para editar suas propriedades.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
