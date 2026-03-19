export type EmailElementType =
    | 'email-section'
    | 'email-columns2'
    | 'email-columns3'
    | 'email-divider'
    | 'email-spacer'
    | 'email-heading'
    | 'email-text'
    | 'email-image'
    | 'email-button'
    | 'email-bullet-list'
    | 'email-social-links'
    | 'email-header'
    | 'email-footer'
    | 'email-banner'
    | 'email-quote'

export interface EmailElementInstance {
    id: string
    type: EmailElementType
    properties: Record<string, any>
    children?: EmailElementInstance[]
}

export interface EmailElementDefinition {
    type: EmailElementType
    designerBtnElement: {
        icon: React.ElementType
        label: string
        category: 'layout' | 'content' | 'special'
    }
    construct: (id: string) => EmailElementInstance
    designerComponent: React.FC<{ element: EmailElementInstance }>
    propertiesComponent: React.FC<{ element: EmailElementInstance }>
    toEmailHtml: (element: EmailElementInstance) => string
}
