/**
 * Email Merge Tags Processing
 * 
 * Replaces merge tags like {{lead.name}} with actual data
 */

export interface MergeTagContext {
    lead?: {
        name?: string
        email?: string
        company?: string | null
        job_title?: string | null
        phone?: string | null
    }
    workspace?: {
        name?: string
    }
    user?: {
        name?: string
    }
}

/**
 * Process merge tags in template string
 */
export function processMergeTags(
    template: string,
    context: MergeTagContext
): string {
    let result = template

    // Lead merge tags
    if (context.lead) {
        result = result.replace(/\{\{lead\.name\}\}/g, context.lead.name || '')
        result = result.replace(/\{\{lead\.email\}\}/g, context.lead.email || '')
        result = result.replace(/\{\{lead\.company\}\}/g, context.lead.company || '')
        result = result.replace(/\{\{lead\.job_title\}\}/g, context.lead.job_title || '')
        result = result.replace(/\{\{lead\.phone\}\}/g, context.lead.phone || '')
    }

    // Workspace merge tags
    if (context.workspace) {
        result = result.replace(/\{\{workspace\.name\}\}/g, context.workspace.name || '')
    }

    // User merge tags
    if (context.user) {
        result = result.replace(/\{\{user\.name\}\}/g, context.user.name || '')
    }

    // System merge tags
    result = result.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString('pt-BR'))

    return result
}

/**
 * Available merge tags organized by category
 */
export const MERGE_TAG_CATEGORIES = {
    lead: [
        { tag: '{{lead.name}}', label: 'Nome do Lead', example: 'João Silva', description: 'Nome completo do lead' },
        { tag: '{{lead.email}}', label: 'Email do Lead', example: 'joao@empresa.com', description: 'Endereço de email' },
        { tag: '{{lead.company}}', label: 'Empresa', example: 'Acme Corp', description: 'Nome da empresa' },
        { tag: '{{lead.job_title}}', label: 'Cargo', example: 'Gerente Comercial', description: 'Cargo/posição' },
        { tag: '{{lead.phone}}', label: 'Telefone', example: '(11) 99999-9999', description: 'Telefone de contato' },
    ],
    workspace: [
        { tag: '{{workspace.name}}', label: 'Nome do Workspace', example: 'Minha Empresa', description: 'Nome do seu workspace' },
    ],
    user: [
        { tag: '{{user.name}}', label: 'Seu Nome', example: 'Maria Santos', description: 'Nome de quem envia' },
    ],
    system: [
        { tag: '{{current_date}}', label: 'Data Atual', example: '16/01/2026', description: 'Data de hoje' },
    ],
} as const

/**
 * Get all available merge tags as flat array
 */
export function getAllMergeTags() {
    return Object.values(MERGE_TAG_CATEGORIES).flat()
}

/**
 * Generate sample context for preview
 */
export function getSampleContext(): MergeTagContext {
    return {
        lead: {
            name: 'João Silva',
            email: 'joao.silva@empresa.com',
            company: 'Acme Corporation',
            job_title: 'Gerente Comercial',
            phone: '(11) 99999-9999',
        },
        workspace: {
            name: 'Minha Empresa',
        },
        user: {
            name: 'Maria Santos',
        },
    }
}
