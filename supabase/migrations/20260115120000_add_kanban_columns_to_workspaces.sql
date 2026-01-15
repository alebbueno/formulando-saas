-- Add kanban_columns to workspaces table
ALTER TABLE "workspaces" 
ADD COLUMN "kanban_columns" JSONB DEFAULT '[
    {"id": "Novo Lead", "label": "Novo Lead", "color": "bg-blue-500", "bg": "bg-blue-50/50 dark:bg-blue-900/10"},
    {"id": "Qualificado", "label": "Qualificado", "color": "bg-emerald-500", "bg": "bg-emerald-50/50 dark:bg-emerald-900/10"},
    {"id": "Em contato", "label": "Em contato", "color": "bg-amber-500", "bg": "bg-amber-50/50 dark:bg-amber-900/10"},
    {"id": "Oportunidade", "label": "Oportunidade", "color": "bg-purple-500", "bg": "bg-purple-50/50 dark:bg-purple-900/10"},
    {"id": "Perdido", "label": "Perdido", "color": "bg-red-500", "bg": "bg-red-50/50 dark:bg-red-900/10"}
]'::jsonb;
