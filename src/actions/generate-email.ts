"use server"

export interface GenerateEmailResult {
    subject: string
    body: string
}

/**
 * Generate email content using AI based on user prompt
 */
export async function generateEmailWithAI(prompt: string): Promise<GenerateEmailResult> {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
        throw new Error("OpenAI API key não configurada")
    }

    try {
        const OpenAI = (await import("openai")).default
        const openai = new OpenAI({ apiKey })

        const systemPrompt = `Você é um especialista em copywriting de emails de marketing B2B.
Você cria emails profissionais, persuasivos e personalizados.

IMPORTANTE:
- Use merge tags para personalização: {{lead.name}}, {{lead.company}}, {{lead.job_title}}, {{workspace.name}}, {{user.name}}, {{current_date}}
- Tom profissional mas amigável
- Máximo 250 palavras no corpo
- Call-to-action claro
- Formato brasileiro (pt-BR)
- Retorne APENAS um JSON válido com {subject: string, body: string}
- Não adicione explicações fora do JSON`

        const userPrompt = `Crie um email profissional sobre: ${prompt}

Requisitos:
- Assunto atraente e personalizado
- Corpo do email bem estruturado
- Use merge tags para personalização
- Inclua call-to-action
- Mantenha tom profissional`

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        })

        const content = response.choices[0].message.content
        if (!content) {
            throw new Error("Nenhuma resposta da IA")
        }

        const result = JSON.parse(content) as GenerateEmailResult

        // Validate result has required fields
        if (!result.subject || !result.body) {
            throw new Error("Resposta da IA inválida")
        }

        return result
    } catch (error) {
        console.error("Error generating email with AI:", error)
        throw new Error("Erro ao gerar email com IA. Tente novamente.")
    }
}
