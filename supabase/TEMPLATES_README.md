# Sistema de Templates

Este diretório contém a estrutura de templates de formulários para o sistema.

## Estrutura

### Tabela `templates`

A tabela `templates` foi criada no schema principal (`schema.sql`) e contém:

- `id` (uuid): Identificador único do template
- `name` (text): Nome do template
- `description` (text): Descrição do template
- `category` (text): Categoria do template (Contato, Eventos, Pesquisa, Feedback, Vendas, Cadastro)
- `content` (jsonb): Conteúdo do formulário em formato JSON (array de FormElementInstance)
- `is_active` (boolean): Se o template está ativo
- `created_at` (timestamp): Data de criação
- `updated_at` (timestamp): Data de atualização

### RLS (Row Level Security)

Os templates são públicos para leitura por usuários autenticados. A gestão administrativa será implementada futuramente.

## Templates Criados

1. **Formulário de Contato**
   - Campos: Nome, E-mail, Telefone, Mensagem
   - Categoria: Contato

2. **Formulário de Inscrição**
   - Campos: Nome, E-mail, Telefone, Data do Evento, Observações
   - Categoria: Eventos

3. **Formulário de Pesquisa**
   - Campos: Nome, Avaliação (Estrelas), Escala de Opinião, Nível de Satisfação, Comentários
   - Categoria: Pesquisa

4. **Formulário de Feedback**
   - Campos: Nome, E-mail, Avaliação Geral, Categoria do Feedback, Comentários
   - Categoria: Feedback

5. **Formulário de Orçamento**
   - Campos: Nome, E-mail, Telefone, Produto/Serviço, Orçamento Estimado, Detalhes do Projeto
   - Categoria: Vendas

6. **Formulário de Cadastro**
   - Campos: Nome, E-mail, Telefone, Data de Nascimento, Endereço, Termos e Condições
   - Categoria: Cadastro

## Como Aplicar

### 1. Aplicar o Schema

Execute o arquivo `schema.sql` no seu banco de dados Supabase para criar a tabela `templates`:

```sql
-- Execute o conteúdo de schema.sql no Supabase SQL Editor
```

### 2. Inserir os Templates

Execute o arquivo `seed-templates.sql` para inserir os 6 templates iniciais:

```sql
-- Execute o conteúdo de seed-templates.sql no Supabase SQL Editor
```

### Via Supabase CLI

Se estiver usando Supabase CLI localmente:

```bash
# Aplicar migrations
supabase db reset

# Ou aplicar apenas o schema
supabase db push
```

### Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute primeiro o conteúdo de `schema.sql` (apenas a parte dos templates)
4. Execute depois o conteúdo de `seed-templates.sql`

## Estrutura do Content (JSON)

O campo `content` é um array JSON de `FormElementInstance`, onde cada elemento tem:

```json
{
  "id": "unique-id",
  "type": "FormElementType",
  "extraAttributes": {
    // Propriedades específicas do tipo de campo
  }
}
```

### Tipos de Campos Disponíveis

- `TitleField`: Título do formulário
- `ParagraphField`: Texto descritivo
- `NameField`: Campo de nome
- `EmailField`: Campo de e-mail
- `PhoneField`: Campo de telefone
- `TextField`: Campo de texto curto
- `TextArea`: Campo de texto longo
- `Select`: Campo de seleção
- `RadioGroup`: Botões de rádio
- `Checkbox`: Caixas de seleção
- `DateField`: Campo de data
- `AddressField`: Campo de endereço
- `StarRatingField`: Avaliação com estrelas
- `OpinionScaleField`: Escala de opinião

## Próximos Passos

1. Criar interface administrativa para gerenciar templates
2. Adicionar funcionalidade para usuários criarem projetos a partir de templates
3. Adicionar mais templates conforme necessário
4. Implementar sistema de categorização e busca de templates
