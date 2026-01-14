import { createClient } from "@supabase/supabase-js"

// Define Node Types we expect
type NodeType = 'trigger' | 'action_email' | 'action_tag' | 'action_status' | 'action_webhook' | 'action_delay'

interface NodeData {
    config?: any
    label?: string
    [key: string]: any
}

interface FlowNode {
    id: string
    type: string
    data: NodeData
    position: { x: number; y: number }
}

interface FlowEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
}

interface AutomationFlow {
    nodes: FlowNode[]
    edges: FlowEdge[]
}

interface ExecutionContext {
    leadId: string
    workspaceId: string
    projectId: string
    triggerData?: any
}

export async function executeAutomation(automationId: string, context: ExecutionContext) {
    console.log(`[AutomationEngine] Starting execution for Automation ${automationId}`, context)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("[AutomationEngine] Missing SUPABASE_SERVICE_ROLE_KEY")
        return { success: false, error: "Server Configuration Error" }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Fetch Automation
    const { data: automation, error } = await supabase
        .from("automations")
        .select("*")
        .eq("id", automationId)
        .single()

    if (error || !automation) {
        console.error("[AutomationEngine] Automation not found", error)
        return { success: false, error: "Automation not found" }
    }

    if (!automation.is_active) {
        console.log("[AutomationEngine] Automation is inactive. Skipping.")
        return { success: true, skipped: true }
    }

    const flow = automation.flow_data as AutomationFlow
    const logs: any[] = []
    let status = 'success'

    try {
        // 2. Find Trigger Node (Start)
        // Usually, there's one node acting as the trigger. 
        // For 'form_submission', it might be a specific Trigger Node or just the root.
        // We'll look for a node with type 'trigger' or similar.
        const triggerNode = flow.nodes.find(n => n.type === 'trigger')

        if (!triggerNode) {
            throw new Error("No trigger node found in flow")
        }

        logs.push({ step: 'start', message: 'Automation triggered', timestamp: new Date().toISOString() })

        // 3. Execution Queue (BFS/DFS)
        // For simplicity in this version, we handle linear or simple branching sequences.
        const queue: string[] = [triggerNode.id]
        const visited = new Set<string>()

        while (queue.length > 0) {
            const nodeId = queue.shift()!
            if (visited.has(nodeId)) continue
            visited.add(nodeId)

            const node = flow.nodes.find(n => n.id === nodeId)
            if (!node) continue

            // Execute Node Action (Skip trigger as it already fired)
            if (node.id !== triggerNode.id) {
                try {
                    await performAction(node, context, supabase)
                    logs.push({ step: node.id, type: node.type, status: 'success', timestamp: new Date().toISOString() })
                } catch (actionError: any) {
                    console.error(`[AutomationEngine] Action failed at node ${node.id}:`, actionError)
                    logs.push({ step: node.id, type: node.type, status: 'error', error: actionError.message, timestamp: new Date().toISOString() })
                    status = 'failure' // Continue or stop? Usually stop on error for that branch.
                    // For now, we continue execution of other independent branches if any, but stop this path.
                    continue
                }
            }

            // 4. Handle Conditional Branching (or simple next)
            let outgoingEdges = flow.edges.filter(e => e.source === nodeId)

            if (node.type === 'condition') {
                // Evaluate Condition
                const { field, operator, value } = node.data.config || {};
                const actualValue = context.triggerData?.data?.[field] || context.triggerData?.[field];

                // Simple comparison
                let isTrue = false;
                if (operator === 'equals') isTrue = actualValue == value;
                else if (operator === 'not_equals') isTrue = actualValue != value;
                else if (operator === 'contains') isTrue = String(actualValue).includes(value);

                logs.push({
                    step: node.id,
                    type: 'condition',
                    status: 'success',
                    message: `Condition ${field} ${operator} ${value} (Actual: ${actualValue}) -> ${isTrue}`,
                    timestamp: new Date().toISOString()
                })

                // Filter edges based on result
                // True handle id is 'true', False handle id is 'false'
                outgoingEdges = outgoingEdges.filter(e => e.sourceHandle === (isTrue ? 'true' : 'false'))
            }

            outgoingEdges.forEach(edge => {
                queue.push(edge.target)
            })
        }

    } catch (err: any) {
        console.error("[AutomationEngine] Execution Failed:", err)
        status = 'failure'
        logs.push({ step: 'error', message: err.message, timestamp: new Date().toISOString() })
    } finally {
        // 4. Log Execution
        await supabase.from("automation_executions").insert({
            automation_id: automationId,
            trigger_event_id: context.leadId,
            status,
            logs: logs
        })
    }

    return { success: status === 'success' }
}

async function performAction(node: FlowNode, context: ExecutionContext, supabase: any) {
    const { type, data } = node

    switch (type) {
        case 'action_tag':
            const tags = data.config?.tags || []
            if (tags.length > 0) {
                // Fetch current tags
                const { data: lead } = await supabase.from('leads').select('tags').eq('id', context.leadId).single()
                const currentTags = lead?.tags || []
                const newTags = Array.from(new Set([...currentTags, ...tags]))

                await supabase.from('leads').update({ tags: newTags }).eq('id', context.leadId)
            }
            break;

        case 'action_status':
            const newStatus = data.config?.status
            if (newStatus) {
                await supabase.from('leads').update({ status: newStatus }).eq('id', context.leadId)
            }
            break;

        case 'action_email':
            // Placeholder: Call email service
            // const templateId = data.config?.templateId
            // await sendEmail(context.lead.email, templateId, ...)
            console.log(`[AutomationEngine] Would send email to lead ${context.leadId} with config`, data.config)
            break;

        case 'action_webhook':
            const url = data.config?.url
            if (url) {
                const payload = {
                    leadId: context.leadId,
                    projectId: context.projectId,
                    triggerData: context.triggerData,
                    timestamp: new Date().toISOString()
                }
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }
            break;

        default:
            console.warn(`[AutomationEngine] Unknown node type: ${type}`)
    }
}
