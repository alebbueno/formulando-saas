-- Seed templates with initial form templates
-- This file inserts the 6 initial templates into the database

-- Template 1: Formulário de Contato
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Contato',
  'Formulário simples para coletar informações de contato com nome, email, telefone e mensagem.',
  'Contato',
  '[
    {
      "id": "title-1",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Entre em Contato"
      }
    },
    {
      "id": "paragraph-1",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Preencha o formulário abaixo e entraremos em contato em breve."
      }
    },
    {
      "id": "name-1",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome Completo",
        "helperText": "Digite seu nome completo",
        "required": true,
        "placeHolder": "Seu nome aqui"
      }
    },
    {
      "id": "email-1",
      "type": "EmailField",
      "extraAttributes": {
        "label": "E-mail",
        "helperText": "Digite seu e-mail",
        "required": true,
        "placeHolder": "seu@email.com"
      }
    },
    {
      "id": "phone-1",
      "type": "PhoneField",
      "extraAttributes": {
        "label": "Telefone",
        "helperText": "Digite seu número de telefone",
        "required": false,
        "placeHolder": "(00) 00000-0000"
      }
    },
    {
      "id": "message-1",
      "type": "TextArea",
      "extraAttributes": {
        "label": "Mensagem",
        "helperText": "Descreva sua mensagem ou dúvida",
        "required": true,
        "placeHolder": "Digite sua mensagem aqui...",
        "rows": 5
      }
    }
  ]'::jsonb,
  true
);

-- Template 2: Formulário de Inscrição (Eventos)
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Inscrição',
  'Formulário para inscrição em eventos com informações de contato e preferências.',
  'Eventos',
  '[
    {
      "id": "title-2",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Inscrição para Evento"
      }
    },
    {
      "id": "paragraph-2",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Preencha os dados abaixo para se inscrever no evento."
      }
    },
    {
      "id": "name-2",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome Completo",
        "helperText": "Digite seu nome completo",
        "required": true,
        "placeHolder": "Seu nome aqui"
      }
    },
    {
      "id": "email-2",
      "type": "EmailField",
      "extraAttributes": {
        "label": "E-mail",
        "helperText": "Digite seu e-mail para confirmação",
        "required": true,
        "placeHolder": "seu@email.com"
      }
    },
    {
      "id": "phone-2",
      "type": "PhoneField",
      "extraAttributes": {
        "label": "Telefone",
        "helperText": "Digite seu número de telefone",
        "required": true,
        "placeHolder": "(00) 00000-0000"
      }
    },
    {
      "id": "date-2",
      "type": "DateField",
      "extraAttributes": {
        "label": "Data do Evento",
        "helperText": "Selecione a data do evento",
        "required": true
      }
    },
    {
      "id": "observations-2",
      "type": "TextArea",
      "extraAttributes": {
        "label": "Observações",
        "helperText": "Alguma observação ou necessidade especial?",
        "required": false,
        "placeHolder": "Digite suas observações...",
        "rows": 4
      }
    }
  ]'::jsonb,
  true
);

-- Template 3: Formulário de Pesquisa
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Pesquisa',
  'Formulário para coletar feedback e opiniões através de perguntas estruturadas.',
  'Pesquisa',
  '[
    {
      "id": "title-3",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Pesquisa de Satisfação"
      }
    },
    {
      "id": "paragraph-3",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Sua opinião é muito importante para nós. Por favor, responda as perguntas abaixo."
      }
    },
    {
      "id": "name-3",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome",
        "helperText": "Digite seu nome (opcional)",
        "required": false,
        "placeHolder": "Seu nome"
      }
    },
    {
      "id": "rating-3",
      "type": "StarRatingField",
      "extraAttributes": {
        "label": "Como você avalia nosso serviço?",
        "helperText": "Selecione uma avaliação de 1 a 5 estrelas",
        "required": true
      }
    },
    {
      "id": "scale-3",
      "type": "OpinionScaleField",
      "extraAttributes": {
        "label": "Qual a probabilidade de você nos recomendar?",
        "helperText": "Selecione uma nota de 1 a 5",
        "required": true
      }
    },
    {
      "id": "satisfaction-3",
      "type": "Select",
      "extraAttributes": {
        "label": "Nível de Satisfação",
        "helperText": "Escolha uma opção",
        "required": true,
        "placeHolder": "Selecione...",
        "options": ["Muito Satisfeito", "Satisfeito", "Neutro", "Insatisfeito", "Muito Insatisfeito"]
      }
    },
    {
      "id": "comments-3",
      "type": "TextArea",
      "extraAttributes": {
        "label": "Comentários Adicionais",
        "helperText": "Tem algo mais a dizer?",
        "required": false,
        "placeHolder": "Digite seus comentários...",
        "rows": 4
      }
    }
  ]'::jsonb,
  true
);

-- Template 4: Formulário de Feedback
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Feedback',
  'Formulário para coletar feedback detalhado com avaliação e comentários.',
  'Feedback',
  '[
    {
      "id": "title-4",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Envie seu Feedback"
      }
    },
    {
      "id": "paragraph-4",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Agradecemos seu tempo! Seu feedback nos ajuda a melhorar continuamente."
      }
    },
    {
      "id": "name-4",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome",
        "helperText": "Digite seu nome",
        "required": true,
        "placeHolder": "Seu nome"
      }
    },
    {
      "id": "email-4",
      "type": "EmailField",
      "extraAttributes": {
        "label": "E-mail",
        "helperText": "Digite seu e-mail (opcional)",
        "required": false,
        "placeHolder": "seu@email.com"
      }
    },
    {
      "id": "rating-4",
      "type": "StarRatingField",
      "extraAttributes": {
        "label": "Avaliação Geral",
        "helperText": "Como você avalia sua experiência?",
        "required": true
      }
    },
    {
      "id": "category-4",
      "type": "RadioGroup",
      "extraAttributes": {
        "label": "Categoria do Feedback",
        "helperText": "Selecione uma categoria",
        "required": true,
        "options": ["Elogio", "Sugestão", "Reclamação", "Dúvida"]
      }
    },
    {
      "id": "feedback-4",
      "type": "TextArea",
      "extraAttributes": {
        "label": "Seu Feedback",
        "helperText": "Descreva seu feedback em detalhes",
        "required": true,
        "placeHolder": "Digite seu feedback aqui...",
        "rows": 6
      }
    }
  ]'::jsonb,
  true
);

-- Template 5: Formulário de Orçamento (Vendas)
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Orçamento',
  'Formulário para solicitação de orçamentos com informações de contato e detalhes do projeto.',
  'Vendas',
  '[
    {
      "id": "title-5",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Solicite um Orçamento"
      }
    },
    {
      "id": "paragraph-5",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Preencha os dados abaixo e retornaremos com uma proposta personalizada."
      }
    },
    {
      "id": "name-5",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome Completo",
        "helperText": "Digite seu nome completo",
        "required": true,
        "placeHolder": "Seu nome aqui"
      }
    },
    {
      "id": "email-5",
      "type": "EmailField",
      "extraAttributes": {
        "label": "E-mail",
        "helperText": "Digite seu e-mail",
        "required": true,
        "placeHolder": "seu@email.com"
      }
    },
    {
      "id": "phone-5",
      "type": "PhoneField",
      "extraAttributes": {
        "label": "Telefone",
        "helperText": "Digite seu número de telefone",
        "required": true,
        "placeHolder": "(00) 00000-0000"
      }
    },
    {
      "id": "product-5",
      "type": "TextField",
      "extraAttributes": {
        "label": "Produto/Serviço de Interesse",
        "helperText": "Qual produto ou serviço você precisa?",
        "required": true,
        "placeHolder": "Descreva o produto ou serviço"
      }
    },
    {
      "id": "budget-5",
      "type": "Select",
      "extraAttributes": {
        "label": "Orçamento Estimado",
        "helperText": "Selecione uma faixa de orçamento",
        "required": false,
        "placeHolder": "Selecione...",
        "options": ["Até R$ 1.000", "R$ 1.000 - R$ 5.000", "R$ 5.000 - R$ 10.000", "R$ 10.000 - R$ 50.000", "Acima de R$ 50.000"]
      }
    },
    {
      "id": "details-5",
      "type": "TextArea",
      "extraAttributes": {
        "label": "Detalhes do Projeto",
        "helperText": "Descreva os detalhes do seu projeto",
        "required": true,
        "placeHolder": "Descreva seu projeto em detalhes...",
        "rows": 6
      }
    }
  ]'::jsonb,
  true
);

-- Template 6: Formulário de Cadastro
insert into templates (name, description, category, content, is_active) values (
  'Formulário de Cadastro',
  'Formulário completo de cadastro com informações pessoais e de contato.',
  'Cadastro',
  '[
    {
      "id": "title-6",
      "type": "TitleField",
      "extraAttributes": {
        "title": "Cadastro"
      }
    },
    {
      "id": "paragraph-6",
      "type": "ParagraphField",
      "extraAttributes": {
        "text": "Preencha todos os campos abaixo para completar seu cadastro."
      }
    },
    {
      "id": "name-6",
      "type": "NameField",
      "extraAttributes": {
        "label": "Nome Completo",
        "helperText": "Digite seu nome completo",
        "required": true,
        "placeHolder": "Seu nome completo"
      }
    },
    {
      "id": "email-6",
      "type": "EmailField",
      "extraAttributes": {
        "label": "E-mail",
        "helperText": "Digite seu e-mail",
        "required": true,
        "placeHolder": "seu@email.com"
      }
    },
    {
      "id": "phone-6",
      "type": "PhoneField",
      "extraAttributes": {
        "label": "Telefone",
        "helperText": "Digite seu número de telefone",
        "required": true,
        "placeHolder": "(00) 00000-0000"
      }
    },
    {
      "id": "birthdate-6",
      "type": "DateField",
      "extraAttributes": {
        "label": "Data de Nascimento",
        "helperText": "Selecione sua data de nascimento",
        "required": true
      }
    },
    {
      "id": "address-6",
      "type": "AddressField",
      "extraAttributes": {
        "label": "Endereço",
        "helperText": "Preencha seu endereço completo",
        "required": true
      }
    },
    {
      "id": "accept-6",
      "type": "Checkbox",
      "extraAttributes": {
        "label": "Termos e Condições",
        "helperText": "Aceito os termos e condições",
        "required": true,
        "options": ["Aceito os termos e condições de uso"]
      }
    }
  ]'::jsonb,
  true
);
