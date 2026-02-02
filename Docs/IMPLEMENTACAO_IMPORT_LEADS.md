1️⃣ IMPORTAÇÃO DE LEADS (PLANILHAS / DOCUMENTOS)
🎯 OBJETIVO

Permitir que o usuário:

Traga leads que já existem

Centralize tudo no Formulando

Ative funil, IA e automações nesses leads

📌 Muito comum para agências e empresas que já têm base antiga.

🧠 COMO ISSO DEVE FUNCIONAR (CONCEITO)

Importar leads não é só subir um arquivo, é:

transformar dados soltos em leads qualificados e acionáveis.

🧩 UX SUGERIDA
📍 Entrada

Botão visível:
👉 Importar leads

Local:

Dentro do workspace

Perto da listagem de leads

🪜 Fluxo em etapas (Wizard)
ETAPA 1 — Upload

Aceitar:

CSV

XLS / XLSX

(futuro: Google Sheets)

Texto:

Importe leads de planilhas para organizar, qualificar e usar automações no Formulando.

ETAPA 2 — Mapeamento de campos (parte crítica)

Interface:

Coluna da planilha → Campo do sistema

Exemplo:

Coluna “Email” → Email

Coluna “Empresa” → Empresa

Coluna “Tamanho da empresa” → Campo customizado

📌 Se campo não existir:
👉 Criar campo personalizado

ETAPA 3 — Regras de importação

Opções:

Ignorar leads duplicados

Atualizar leads existentes

Definir etapa inicial do funil

Aplicar tag (ex: “importado”)

ETAPA 4 — Qualificação automática pós-importação

Checkbox:
✔ Aplicar regras de qualificação
✔ Aplicar IA de qualificação

Texto:

Os leads importados serão analisados automaticamente.

ETAPA 5 — Confirmação

Resumo:

X leads importados

X ignorados

X com erro

CTA:
👉 Ver leads no funil

📊 EVENTOS IMPORTANTES

lead_import_started

lead_import_mapped

lead_import_completed

lead_import_failed