export function getInvitationEmailHtml({
    inviterName,
    inviteLink
}: {
    inviterName: string,
    inviteLink: string
}) {
    const previewText = `${inviterName} convidou você para o Formulando`

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite Formulando</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #09090b; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #ffffff; padding: 32px 40px; border-bottom: 1px solid #e4e4e7; text-align: center; }
        .logo { font-size: 24px; font-weight: 700; color: #09090b; text-decoration: none; letter-spacing: -1px; }
        .logo span { color: #8831d2; }
        .content { padding: 40px; text-align: center; }
        .h1 { font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #09090b; }
        .text { font-size: 16px; line-height: 26px; color: #71717a; margin-bottom: 32px; }
        .button { display: inline-block; background-color: #8831d2; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; transition: background-color 0.2s; }
        .link-text { font-size: 14px; color: #a1a1aa; margin-top: 32px; word-break: break-all; }
        .footer { padding: 32px; background-color: #fafafa; text-align: center; font-size: 12px; color: #a1a1aa; }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">
        ${previewText}
    </div>
    
    <div class="container">
        <div class="header">
            <div class="logo">
                Formulando<span>.</span>
            </div>
        </div>
        
        <div class="content">
            <h1 class="h1">Você foi convidado! ✉️</h1>
            
            <p class="text">
                Olá! <strong>${inviterName}</strong> convidou você para colaborar em um workspace no <strong>Formulando</strong>.
            </p>
            
            <p class="text">
                Aceite o convite para acessar dashboards, criar novos formulários e gerenciar leads em equipe.
            </p>
            
            <a href="${inviteLink}" class="button" target="_blank">
                Aceitar Convite
            </a>
            
            <p class="link-text">
                Ou copie e cole este link no seu navegador:<br>
                ${inviteLink}
            </p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Formulando SaaS. Todos os direitos reservados.</p>
            <p>Se você não esperava por este convite, pode ignorar este email.</p>
        </div>
    </div>
</body>
</html>
    `
}
