/**
 * Pre-built Email Templates
 * Professional, modern email templates with reliable HTML rendering
 */

export interface EmailTemplateDefinition {
    id: string
    name: string
    category: 'welcome' | 'follow-up' | 'promo' | 'general'
    description: string
    subject: string
    body: string
    preview: string
    tags: string[]
    icon: string
}

// Modern Design System Tokens
const THEME = {
    colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#0f172a',
        text: {
            main: '#334155',
            heading: '#0f172a',
            muted: '#64748b',
            inverted: '#ffffff'
        },
        border: '#e2e8f0',
        accent: '#3b82f6',
        success: '#22c55e'
    },
    fonts: {
        main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px'
    }
}

// Robust HTML boilerplate for email clients
const BASE_TEMPLATE = (content: string, preheader: string = '') => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${THEME.fonts.main};">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Email Template</title>
    <style type="text/css">
        body, td, div, p, a, span { font-family: ${THEME.fonts.main} !important; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; max-width: 100% !important; }
            .content { padding: 24px 20px !important; }
            .header { padding: 24px 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; margin-bottom: 20px !important; }
            .mobile-hidden { display: none !important; }
        }
    </style>
</head>
<body style="width: 100% !important; height: 100%; margin: 0; padding: 0; background-color: ${THEME.colors.background}; -webkit-text-size-adjust: none; color: ${THEME.colors.text.main};">
    <!-- Hidden Preheader -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        ${preheader}
        &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; background-color: ${THEME.colors.background};">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Main Container -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; max-width: 600px; background-color: ${THEME.colors.surface}; border-radius: 12px; border: 1px solid ${THEME.colors.border}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <!-- Header -->
                    <tr>
                        <td class="header" style="padding: 32px 40px; text-align: center; border-bottom: 1px solid ${THEME.colors.border}; background: linear-gradient(to bottom, #ffffff, #fafafa);">
                            <span style="font-size: 20px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -0.5px; text-decoration: none;">{{workspace.name}}</span>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content" style="padding: 40px; font-size: 16px; line-height: 1.6; color: ${THEME.colors.text.main};">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 32px 40px; border-top: 1px solid ${THEME.colors.border}; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: ${THEME.colors.text.heading};">Enviado por {{user.name}}</p>
                            <p style="margin: 0 0 24px; font-size: 13px; color: ${THEME.colors.text.muted};">{{workspace.name}} • Transformando ideias em resultados</p>
                            
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="font-size: 12px; color: ${THEME.colors.text.muted}; text-decoration: underline; margin: 0 10px;">Descadastrar</a>
                                        <a href="#" style="font-size: 12px; color: ${THEME.colors.text.muted}; text-decoration: underline; margin: 0 10px;">Política de Privacidade</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Bottom Branding -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} {{workspace.name}}. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
`

// Reusable component snippets
const COMPONENTS = {
    button: (text: string, href: string = '#', primary: boolean = true) => `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px auto;">
            <tr>
                <td align="center" bgcolor="${primary ? THEME.colors.primary : 'transparent'}" style="border-radius: 8px; ${!primary ? `border: 2px solid ${THEME.colors.border}` : ''}">
                    <a href="${href}" style="display: inline-block; padding: 14px 32px; font-family: ${THEME.fonts.main}; font-size: 16px; font-weight: 600; text-decoration: none; color: ${primary ? '#ffffff' : THEME.colors.text.heading}; border-radius: 8px;">
                        ${text}
                        ${primary ? '&nbsp;&nbsp;&rarr;' : ''}
                    </a>
                </td>
            </tr>
        </table>
    `,
    divider: `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 32px 0;">
            <tr>
                <td style="border-top: 1px solid ${THEME.colors.border};"></td>
            </tr>
        </table>
    `,
    highlightBox: (content: string) => `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 32px 0; background-color: #f8fafc; border: 1px solid ${THEME.colors.border}; border-radius: 8px;">
            <tr>
                <td style="padding: 24px;">
                    ${content}
                </td>
            </tr>
        </table>
    `
}

export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
    {
        id: 'welcome',
        name: 'Boas-vindas Premium',
        category: 'welcome',
        description: 'Design impactante para causar uma ótima primeira impressão',
        preview: 'Bem-vindo(a)! Estamos felizes em ter você aqui.',
        icon: '👋',
        tags: ['onboarding', 'welcome'],
        subject: 'Bem-vindo à {{workspace.name}}, {{lead.name}}!',
        body: BASE_TEMPLATE(`
            <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -0.5px; text-align: center;">Bem-vindo a bordo! 🎉</h1>
            
            <p style="margin: 0 0 24px;">Olá {{lead.name}},</p>
            
            <p style="margin: 0 0 24px;">É um prazer imenso ter você conosco na <strong>{{workspace.name}}</strong>. Estamos animados para ver o que você vai construir conosco.</p>
            
            ${COMPONENTS.highlightBox(`
                <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px; color: ${THEME.colors.text.heading};">Por onde começar?</h2>
                <p style="margin: 0; font-size: 15px; color: ${THEME.colors.text.muted};">Preparamos um guia rápido para você dar os primeiros passos com total confiança e agilidade.</p>
            `)}

            ${COMPONENTS.button('Acessar Minha Conta')}

            <p style="margin: 0 0 16px; text-align: center; color: ${THEME.colors.text.muted}; font-size: 14px;">Se tiver qualquer dúvida, responda este email. Estamos aqui para ajudar.</p>
        `, 'Tudo pronto para começar sua jornada conosco!'),
    },
    {
        id: 'follow-up-lead',
        name: 'Follow-up Executivo',
        category: 'follow-up',
        description: 'Profissional e direto, ideal para tomadores de decisão',
        preview: 'Gostaria de retomar nossa conversa.',
        icon: '🤝',
        tags: ['sales', 'b2b'],
        subject: '{{lead.name}}, sobre a {{lead.company}}',
        body: BASE_TEMPLATE(`
            <p style="margin: 0 0 24px;">Olá {{lead.name}},</p>
            
            <p style="margin: 0 0 24px;">Espero que sua semana esteja sendo produtiva.</p>
            
            <p style="margin: 0 0 24px;">Estive pensando sobre os desafios que a <strong>{{lead.company}}</strong> pode estar enfrentando e como nossa solução tem ajudado empresas similares a escalar suas operações de forma eficiente.</p>
            
            <h2 style="font-size: 20px; font-weight: 700; color: ${THEME.colors.text.heading}; margin: 32px 0 16px;">Podemos conversar?</h2>
            
            <p style="margin: 0 0 24px;">Uma breve call de 15 minutos seria suficiente para eu lhe mostrar algumas ideias que podem fazer sentido para o seu momento atual.</p>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                    <td style="border-left: 4px solid ${THEME.colors.primary}; padding-left: 20px;">
                        <a href="#" style="font-size: 16px; font-weight: 600; color: ${THEME.colors.accent}; text-decoration: none;">➝ Agendar horário na minha agenda</a>
                    </td>
                </tr>
            </table>
        `, 'Uma ideia rápida para a sua empresa'),
    },
    {
        id: 'meeting-request',
        name: 'Convite Reunião',
        category: 'follow-up',
        description: 'Sugestão clara de horários com call-to-action focado',
        preview: 'Vamos agendar nossa conversa?',
        icon: '📅',
        tags: ['schedule', 'meeting'],
        subject: 'Convite: Reunião {{workspace.name}} + {{lead.company}}',
        body: BASE_TEMPLATE(`
            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${THEME.colors.text.heading}; text-align: center;">Vamos agendar nossa conversa?</h1>
            
            <p style="margin: 0 0 24px;">Olá {{lead.name}},</p>
            
            <p style="margin: 0 0 24px;">Gostaria muito de apresentar nossas novidades e entender como podemos apoiar os próximos passos da <strong>{{lead.company}}</strong>.</p>
            
            ${COMPONENTS.highlightBox(`
                <p style="margin: 0 0 16px; font-weight: 600; color: ${THEME.colors.text.heading}; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Horários Sugeridos</p>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <strong style="color: ${THEME.colors.text.heading};">Terça-feira</strong>
                            <span style="float: right; color: ${THEME.colors.text.muted};">14:00h</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <strong style="color: ${THEME.colors.text.heading};">Quarta-feira</strong>
                            <span style="float: right; color: ${THEME.colors.text.muted};">10:00h</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <strong style="color: ${THEME.colors.text.heading};">Quinta-feira</strong>
                            <span style="float: right; color: ${THEME.colors.text.muted};">15:00h</span>
                        </td>
                    </tr>
                </table>
            `)}

            ${COMPONENTS.button('Ver Agenda Completa')}
            
            <p style="text-align: center; margin: 0; font-size: 14px; color: ${THEME.colors.text.muted};">Se preferir outro horário, fique à vontade para sugerir.</p>
        `, 'Sugestões de horário para nossa reunião'),
    },
    {
        id: 'product-launch',
        name: 'Lançamento Produto',
        category: 'promo',
        description: 'Visual moderno e ousado para anunciar novidades',
        preview: 'Conheça o novo recurso que acabou de chegar.',
        icon: '🚀',
        tags: ['launch', 'news'],
        subject: '🚀 Novidade: Conheça o futuro da {{workspace.name}}',
        body: BASE_TEMPLATE(`
            <div style="text-align: center; margin-bottom: 32px;">
                <span style="display: inline-block; padding: 6px 12px; background-color: #f1f5f9; color: ${THEME.colors.text.muted}; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">BETA PÚBLICO</span>
            </div>

            <h1 style="margin: 0 0 24px; font-size: 36px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -1px; text-align: center; line-height: 1.1;">O futuro chegou.<br>E é incrível.</h1>
            
            <p style="margin: 0 0 32px; font-size: 18px; line-height: 1.6; color: ${THEME.colors.text.muted}; text-align: center;">Olá {{lead.name}}, trabalhamos duro nos últimos meses para trazer algo que vai mudar a forma como você trabalha.</p>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 32px 0; border-radius: 16px; overflow: hidden;">
                <tr>
                    <td style="background-color: ${THEME.colors.primary}; padding: 48px 32px; text-align: center;">
                        <img src="https://placehold.co/100x100/334155/ffffff?text=✨" alt="Feature Icon" style="width: 64px; height: 64px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                        <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 24px; font-weight: 700;">Novo Recurso Premium</h2>
                        <p style="margin: 0 0 32px; color: #94a3b8; font-size: 16px;">Mais rápido, mais inteligente e desenhado para você.</p>
                        <a href="#" style="display: inline-block; background-color: #ffffff; color: ${THEME.colors.primary}; padding: 14px 32px; border-radius: 8px; font-weight: 700; text-decoration: none;">Experimentar Agora</a>
                    </td>
                </tr>
            </table>

            <p style="text-align: center; color: ${THEME.colors.text.muted}; font-size: 14px;">Disponível imediatamente para todos os usuários Pro.</p>
        `, 'Uma atualização importante para você'),
    },
    {
        id: 'promotion',
        name: 'Oferta Especial',
        category: 'promo',
        description: 'Focado em conversão com destaque para cupons',
        preview: 'Um presente especial para você.',
        icon: '💰',
        tags: ['sales', 'offer'],
        subject: 'Um presente especial para {{lead.name}} 🎁',
        body: BASE_TEMPLATE(`
            <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: ${THEME.colors.text.heading}; text-align: center; letter-spacing: -1px;">Oferta Exclusiva</h1>
            
            <p style="margin: 0 0 24px; text-align: center; font-size: 18px; color: ${THEME.colors.text.muted};">Obrigado por estar conosco!</p>
            
            <p style="margin: 0 0 32px; text-align: center;">Como forma de agradecimento pelo seu interesse na {{workspace.name}}, liberamos um desconto exclusivo para você.</p>
            
            <div style="border: 2px dashed ${THEME.colors.border}; border-radius: 16px; padding: 40px 20px; text-align: center; margin: 32px 0; background-color: #ffffff;">
                <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: ${THEME.colors.text.muted}; letter-spacing: 2px; font-weight: 600;">SEU CUPOM</p>
                <div style="margin: 16px 0; font-family: monospace; font-size: 42px; font-weight: 700; color: ${THEME.colors.text.heading}; letter-spacing: -1px;">SPECIAL20</div>
                <div style="display: inline-block; padding: 6px 12px; background-color: #ecfdf5; color: #047857; border-radius: 20px; font-size: 14px; font-weight: 600;">20% OFF no primeiro mês</div>
            </div>

            ${COMPONENTS.button('Resgatar Meu Desconto')}

            <p style="margin: 24px 0 0; font-size: 13px; color: ${THEME.colors.text.muted}; text-align: center;">* Oferta válida até {{current_date}}. Não acumulável com outras promoções.</p>
        `, 'Desconto exclusivo te esperando'),
    },
    {
        id: 'newsletter',
        name: 'Newsletter Clean',
        category: 'general',
        description: 'Layout editorial limpo para conteúdo rico e leitura agradável',
        preview: 'As novidades da semana selecionadas para você.',
        icon: '📰',
        tags: ['content', 'news'],
        subject: 'Weekly Digest: As novidades da {{workspace.name}}',
        body: BASE_TEMPLATE(`
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid ${THEME.colors.border};">
                <span style="font-size: 12px; font-weight: 700; color: ${THEME.colors.text.heading}; text-transform: uppercase; letter-spacing: 2px;">Weekly Digest</span>
                <h1 style="margin: 16px 0 0; font-size: 32px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -1px;">Formulando News</h1>
            </div>

            <!-- Article 1 -->
            <div style="margin-bottom: 40px;">
                <span style="font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">Tendência</span>
                <h3 style="margin: 12px 0; font-size: 22px; font-weight: 700; color: ${THEME.colors.text.heading}; line-height: 1.3;">Como escalar suas operações em 2026</h3>
                <p style="margin: 0 0 16px; color: ${THEME.colors.text.muted};">Descubra as estratégias que as empresas que mais crescem estão usando para automatizar processos e reduzir custos.</p>
                <a href="#" style="font-size: 15px; font-weight: 600; color: ${THEME.colors.accent}; text-decoration: none;">Ler artigo completo &rarr;</a>
            </div>

            ${COMPONENTS.divider}

            <!-- Article 2 -->
            <div style="margin-bottom: 40px;">
                <span style="font-size: 12px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">Dica Prática</span>
                <h3 style="margin: 12px 0; font-size: 22px; font-weight: 700; color: ${THEME.colors.text.heading}; line-height: 1.3;">O segredo da retenção de clientes</h3>
                <p style="margin: 0 0 16px; color: ${THEME.colors.text.muted};">Pequenos ajustes no seu onboarding podem aumentar sua retenção em até 40% nas primeiras semanas.</p>
                <a href="#" style="font-size: 15px; font-weight: 600; color: ${THEME.colors.accent}; text-decoration: none;">Ler artigo completo &rarr;</a>
            </div>

            <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; text-align: center; margin-top: 32px;">
                <p style="margin: 0; font-size: 14px; color: ${THEME.colors.text.heading}; font-weight: 500;">Gostou do conteúdo?</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: ${THEME.colors.text.muted};">Encaminhe este email para seu time!</p>
            </div>
        `, 'Conteúdo selecionado para sua leitura'),
    },
    {
        id: 'thank-you',
        name: 'Agradecimento',
        category: 'general',
        description: 'Minimalista e genuíno para fortalecer relacionamentos',
        preview: 'Muito obrigado pela sua parceria.',
        icon: '🙏',
        tags: ['gratitude'],
        subject: 'Obrigado, {{lead.name}}!',
        body: BASE_TEMPLATE(`
            <div style="text-align: center; padding: 24px 0;">
                <p style="font-size: 48px; margin: 0 0 24px;">🌟</p>
                <h1 style="margin: 0 0 24px; font-size: 32px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -1px;">Muito obrigado!</h1>
                
                <p style="margin: 0 0 24px; font-size: 18px; color: ${THEME.colors.text.muted};">Sua parceria significa mundo para nós.</p>
            </div>
            
            <p style="margin: 0 0 24px;">Olá {{lead.name}},</p>
            
            <p style="margin: 0 0 24px;">Só queria passar para agradecer genuinamente pela sua confiança na <strong>{{workspace.name}}</strong>. Clientes como a <strong>{{lead.company}}</strong> são o motivo pelo qual fazemos o que fazemos todos os dias.</p>
            
            <p style="margin: 0 0 24px;">Conte conosco sempre para o que precisar.</p>
            
            <p style="margin: 32px 0 0; font-family: '${THEME.fonts.heading}'; font-weight: 600; color: ${THEME.colors.text.heading};">Com gratidão,<br>{{user.name}}</p>
        `, 'Um agradecimento sincero'),
    },
    {
        id: 're-engagement',
        name: 'Reativação',
        category: 'follow-up',
        description: 'Gentil e eficaz para recuperar contatos',
        preview: 'Ainda tem interesse?',
        icon: '🔄',
        tags: ['reconnect'],
        subject: '{{lead.name}}, ainda tem interesse?',
        body: BASE_TEMPLATE(`
            <p style="margin: 0 0 24px;">Olá {{lead.name}},</p>
            
            <p style="margin: 0 0 24px;">Notei que não conversamos há um tempo e não quero ser invasivo na sua caixa de entrada.</p>
            
            <p style="margin: 0 0 24px;">Vou assumir que otimizar seus processos na <strong>{{lead.company}}</strong> não é uma prioridade no momento, então esta será minha última mensagem por enquanto.</p>
            
            <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <p style="margin: 0 0 12px; font-weight: 600; color: #92400e;">Mas se eu estiver enganado...</p>
                <p style="margin: 0 0 16px; color: #b45309;">Se você ainda quiser conversar, basta clicar no link abaixo que retomamos de onde paramos:</p>
                <a href="#" style="font-weight: 600; color: #d97706; text-decoration: underline;">Sim, ainda tenho interesse &rarr;</a>
            </div>
            
            <p style="margin: 0 0 24px;">Caso contrário, desejo muito sucesso!</p>
            
            <p style="margin: 0;">Um abraço,<br><strong>{{user.name}}</strong></p>
        `, 'Última tentativa de contato'),
    },
]

export function getTemplateById(id: string): EmailTemplateDefinition | undefined {
    return EMAIL_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: string): EmailTemplateDefinition[] {
    return EMAIL_TEMPLATES.filter(t => t.category === category)
}

export function getInvitationEmailHtml({ inviterName, inviteLink }: { inviterName: string, inviteLink: string }) {
    // Reusing the same reliable base template/styles, but constructing specifically for invite
    // Can't use BASE_TEMPLATE directly because it relies on merge tags {{workspace.name}} etc which might not be in context
    // So we manually construct with the same style system

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${THEME.fonts.main};">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Convite para Formulando</title>
    <style type="text/css">
        body, td, div, p, a, span { font-family: ${THEME.fonts.main} !important; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; max-width: 100% !important; }
            .content { padding: 24px 20px !important; }
        }
    </style>
</head>
<body style="width: 100% !important; height: 100%; margin: 0; padding: 0; background-color: ${THEME.colors.background}; color: ${THEME.colors.text.main};">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; background-color: ${THEME.colors.background};">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; max-width: 600px; background-color: ${THEME.colors.surface}; border-radius: 12px; border: 1px solid ${THEME.colors.border}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td class="header" style="padding: 32px 40px; text-align: center; border-bottom: 1px solid ${THEME.colors.border}; background: #ffffff;">
                            <span style="font-size: 24px; font-weight: 800; color: ${THEME.colors.text.heading}; letter-spacing: -0.5px;">formulando.</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="content" style="padding: 40px;">
                            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${THEME.colors.text.heading}; text-align: center;">Você foi convidado! 📨</h1>
                            
                            <p style="margin: 0 0 24px; text-align: center; font-size: 16px; line-height: 1.6;">
                                <strong>${inviterName}</strong> convidou você para colaborar em um workspace no <strong>Formulando</strong>.
                            </p>

                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px auto;">
                                <tr>
                                    <td align="center" bgcolor="${THEME.colors.primary}" style="border-radius: 8px;">
                                        <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; font-family: ${THEME.fonts.main}; font-size: 16px; font-weight: 600; text-decoration: none; color: #ffffff; border-radius: 8px;">
                                            Aceitar Convite &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 24px 0 0; font-size: 14px; color: ${THEME.colors.text.muted}; text-align: center;">
                                Ou copie e cole este link:<br>
                                <span style="color: ${THEME.colors.accent}; word-break: break-all;">${inviteLink}</span>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid ${THEME.colors.border}; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: ${THEME.colors.text.muted};">Se você não esperava este convite, pode ignorar este email com segurança.</p>
                        </td>
                    </tr>
                </table>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Formulando SaaS.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}
