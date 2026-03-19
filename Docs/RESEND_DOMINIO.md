# 📧 Plano de Implementação — Conexão de Domínio do Cliente (Resend)

## 🎯 Objetivo
Permitir que usuários do SaaS conectem seus próprios domínios para envio de e-mails, garantindo:
- Personalização (`@dominio-do-cliente.com`)
- Melhor entregabilidade (SPF, DKIM, DMARC)
- Isolamento por cliente (multi-tenant seguro)

Integração com a API do Resend para gerenciamento automático.

---

# 🧱 Arquitetura Geral

## Componentes
- **Frontend:** Next.js + shadcn/ui
- **Backend:** API Routes (Node.js / TypeScript)
- **Banco:** Supabase (PostgreSQL)
- **Email Service:** Resend

---

# 🗄️ Modelagem de Banco

## Tabela: `domains`
```sql
id uuid primary key
user_id uuid
domain text
status text -- pending | verified | failed
resend_domain_id text
dns_records jsonb
created_at timestamp
updated_at timestamp
🔄 Fluxo Completo
1. Usuário adiciona domínio

Input: cliente.com ou mail.cliente.com

Backend
POST /api/domains
Ações:

Criar domínio no Resend

Salvar no banco

Retornar DNS necessários

2. Criar domínio no Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = await resend.domains.create({
  name: "cliente.com"
});
Salvar:

resend_domain_id

dns_records

3. Exibir instruções DNS (Frontend)
UI sugerida:
Tela: "Conectar domínio"

Campo: domínio

Lista de DNS (copiar botão)

Status: pendente

4. Estrutura de DNS esperada
Tipo	Nome	Valor
TXT	@	SPF
CNAME	resend._domainkey	DKIM
MX	(opcional)	Return-Path
5. Verificação de domínio
Endpoint:
GET /api/domains/:id/verify
Backend:
const domain = await resend.domains.get(domainName);
Atualizar status:

verified

pending

6. Polling automático (opcional, recomendado)

Worker roda a cada 5 minutos

Verifica todos pending

Atualiza status automaticamente

7. Bloqueio de envio sem verificação
if (domain.status !== "verified") {
  throw new Error("Domínio não verificado");
}
8. Envio de e-mail com domínio do cliente
await resend.emails.send({
  from: `Marketing <marketing@cliente.com>`,
  to: email,
  subject: "...",
  html: "..."
});
🔐 Segurança (CRÍTICO)
Multi-tenant

Sempre validar:

domain.user_id === currentUser.id
Anti-abuso

Limite de envio por plano

Rate limiting

Monitoramento de bounce e spam

💡 UX Recomendada
Etapas visuais

Inserir domínio

Exibir DNS

Botão "Copiar"

Botão "Verificar"

Status visual:

🟡 Pendente

🟢 Verificado

🔴 Erro

⚡ Melhorias Avançadas
1. Subdomínio recomendado

Sugerir:

mail.cliente.com
2. Tracking customizado

click.cliente.com

open.cliente.com

3. Warm-up de domínio

Envio gradual

Aumenta reputação

4. Webhooks (futuro)

bounce

complaint

delivery

🧪 Testes
Cenários

✅ Domínio válido + DNS correto

❌ DNS incompleto

❌ Domínio não verificado tentando enviar

✅ Multi-tenant isolado

✅ Revalidação após mudança de DNS

🚀 Roadmap de Implementação
Fase 1 (MVP)

Criar domínio

Exibir DNS

Verificar manualmente

Enviar com domínio

Fase 2

Polling automático

UI melhorada

Feedback de erro DNS

Fase 3

Tracking customizado

Warm-up

Webhooks

📌 Checklist Final

 Criar tabela domains

 Endpoint POST /domains

 Integração com Resend (create domain)

 UI de configuração DNS

 Endpoint de verificação

 Bloqueio de envio sem verificação

 Envio com domínio customizado

 Segurança multi-tenant