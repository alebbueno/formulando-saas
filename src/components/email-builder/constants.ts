export const EMAIL_SAFE_FONTS = [
    { label: 'Arial', value: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, Times, "Times New Roman", serif' },
    { label: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { label: 'Lucida Sans', value: '"Lucida Sans Unicode", "Lucida Grande", sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Verdana, Segoe, sans-serif' },
    { label: 'Times New Roman', value: 'TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]

export const FONT_WEIGHTS = [
    { label: 'Normal', value: 'normal' },
    { label: 'Médio', value: '500' },
    { label: 'Semi-Negrito', value: '600' },
    { label: 'Negrito', value: 'bold' },
]

export const MERGE_TAGS = [
    { label: 'Nome do Lead', value: '{{lead.name}}' },
    { label: 'Email do Lead', value: '{{lead.email}}' },
    { label: 'Empresa', value: '{{lead.company}}' },
    { label: 'Cargo', value: '{{lead.job_title}}' },
    { label: 'Nome da Empresa/Workspace', value: '{{workspace.name}}' },
    { label: 'Seu Nome (Remetente)', value: '{{user.name}}' },
    { label: 'Data Atual', value: '{{current_date}}' },
]
