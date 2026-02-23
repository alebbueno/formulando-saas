import { getActiveWorkspace } from "@/lib/get-active-workspace"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, KeyRound, Webhook, Code2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default async function ApiDocsPage() {
    const { activeWorkspace } = await getActiveWorkspace() || {}

    if (!activeWorkspace?.id) {
        return <div>Selecione um workspace</div>
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/integrations`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground/80">
                        <BookOpen className="w-6 h-6 text-primary" />
                        Documentação da API
                    </h2>
                    <p className="text-muted-foreground">
                        Guia completo para integrar seus sistemas via API e Webhooks.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 pb-10">
                {/* 1. API: Recebendo Leads */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="w-5 h-5" />
                            Recebendo Leads (Inbound API)
                        </CardTitle>
                        <CardDescription>
                            Envie leads de outras plataformas, landing pages ou sistemas próprios diretamente para o seu workspace no Formulando.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <KeyRound className="w-4 h-4 text-muted-foreground" />
                                Autenticação
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Todas as requisições devem incluir o header <code className="bg-muted px-1 rounded">Authorization: Bearer {'<SEU_TOKEN>'}</code>.
                                Você pode gerar um novo token na aba de integrações.
                            </p>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                Endpoint Principal
                            </h3>
                            <div className="flex items-center gap-3 bg-muted p-3 rounded-md mb-4 font-mono text-sm border">
                                <Badge variant="default">POST</Badge>
                                <span>https://app.formulando.tech/api/v1/leads</span>
                            </div>

                            <h4 className="font-medium mt-4 mb-2 text-sm text-foreground/80">Headers Requeridos</h4>
                            <div className="bg-muted p-4 rounded-md border text-sm font-mono overflow-x-auto whitespace-pre">
                                {`{
  "Content-Type": "application/json",
  "Authorization": "Bearer <SEU_TOKEN>"
}`}
                            </div>

                            <h4 className="font-medium mt-6 mb-2 text-sm text-foreground/80">Payload (Body)</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                O único campo estritamente obrigatório é o <code className="bg-muted px-1 rounded">email</code>.
                                Campos reconhecidos receberão pontuação (score) automática. Qualquer outro campo enviado será salvo como campo customizado.
                            </p>
                            <div className="bg-slate-950 p-4 rounded-md border text-sm font-mono text-green-400 overflow-x-auto whitespace-pre">
                                {`{
  "name": "Maria Silva",
  "email": "maria@empresa.com", // Obrigatório
  "phone": "11999999999",
  "company": "Empresa S.A.",
  "job_title": "Diretora de Vendas",
  "status": "Novo Lead", // Opcional (Sobrescreve o status padrão)
  "minha_pergunta_customizada": "Gostaria de marcar uma demonstração.",
  "origem_campanha": "Facebook Ads"
}`}
                            </div>

                            <h4 className="font-medium mt-6 mb-2 text-sm text-foreground/80">Resposta de Sucesso (201 Created)</h4>
                            <div className="bg-muted p-4 rounded-md border text-sm font-mono overflow-x-auto whitespace-pre">
                                {`{
  "success": true,
  "lead_id": "c1b5..."
}`}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Webhooks: Enviando Leads */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Webhook className="w-5 h-5" />
                            Webhooks (Outbound API)
                        </CardTitle>
                        <CardDescription>
                            Receba notificações em tempo real sempre que um lead for criado (seja via formulário, edição manual ou via API).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Ao configurar um webhook na área de Integrações, nosso sistema fará um POST para a URL configurada sempre que o evento ocorrer.
                            </p>

                            <h4 className="font-medium mt-4 mb-2 text-sm text-foreground/80">Segurança</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Se você preencher a chave secreta (Secret) nas configurações do webhook,
                                incluiremos o header <code className="bg-muted px-1 rounded">X-Formulando-Signature</code>.
                                Esse header contém o HMAC (SHA-256) gerado com o corpo da requisição e o Secret, permitindo validar a autenticidade na sua aplicação.
                            </p>

                            <h4 className="font-medium mt-6 mb-2 text-sm text-foreground/80">Payload Enviado</h4>
                            <div className="bg-slate-950 p-4 rounded-md border text-sm font-mono text-blue-400 overflow-x-auto whitespace-pre">
                                {`{
  "id": "e4d2... (Id único do evento)",
  "created_at": "2026-02-23T12:00:00.000Z",
  "event": "lead.created",
  "lead": {
    "id": "c1b5... (Id do lead no formulando)",
    "name": "João Pereira",
    "email": "joao@exemplo.com",
    "phone": "11988888888",
    "company": "Exemplo LTDA",
    "job_title": "Gerente",
    "status": "Qualificado",
    "score": 60,
    "tags": ["api", "decisor", "alto-interesse"],
    "custom_fields": {
        "interesse": "Plano Pro"
    }
  }
}`}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
