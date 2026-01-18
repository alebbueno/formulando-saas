"use server"

import { createClient } from "@/lib/supabase/server"
import { LPElement } from "@/components/lp-builder/types"

export interface GenerateLPResult {
    success: boolean
    elements?: LPElement[]
    error?: string
}

export async function generateLPWithAI(prompt: string, currentElements?: LPElement[]): Promise<GenerateLPResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { success: false, error: "Configuração de IA (OpenAI) ausente no servidor." }
    }

    try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey });

        const isEditing = currentElements && currentElements.length > 0;
        let systemPrompt = "";

        const elementDefinitions = `
        The available element types are (use these EXACT keys):
        - "section": Top-level wrapper. 
          * STYLE RULE: Must have padding (e.g. '80px 20px').
          * STYLE RULE: Use alternating backgrounds (e.g. white vs #f8fafc vs dark #0f172a).
        - "container": Inner content wrapper. Centered.
        - "2-col": Two column layout. ESSENTIAL for modern design.
        - "3-col": Three column layout. Great for features/testimonials.
        - "column": Used inside multi-col layouts.
        - "heading": h1-h6 headings.
        - "text": Paragraph text. 
          * STYLE RULE: Use lineHeight '1.6' and specific colors (#334155).
        - "button": Call to action buttons.
          * STYLE RULE: Add borderRadius ('8px'), padding ('12px 32px'), fontWeight '600'.
        - "image": Images. Use "https://placehold.co/600x400".
          * STYLE RULE: Add borderRadius ('12px') and boxShadow ('0 4px 6px -1px rgb(0 0 0 / 0.1)').
        - "video": Video embed.
        - "icon": Vector icons.
        - "spacer": Vertical spacing.
        - "social": Social media icons.
        - "form": Embedded form placeholder.

        Element Interface:
        interface LPElement {
            id: string; 
            type: LPElementType;
            styles?: Record<string, any>; // CSS properties
            content?: string; 
            url?: string; 
            children?: LPElement[];
            properties?: Record<string, any>; 
            responsiveStyles?: {
                mobile?: Record<string, any>; 
                tablet?: Record<string, any>;
                desktop?: Record<string, any>;
            };
        }
        
        CRITICAL RULES FOR MOBILE RESPONSIVENESS:
        1. "2-col" and "3-col" MUST include: responsiveStyles: { mobile: { flexDirection: 'column' } }
        2. Adjust padding: responsiveStyles: { mobile: { padding: '40px 20px' } }
        `;

        systemPrompt = `
        You are a World-Class Web Designer seeking to create "Awwwards" winning designs.
        Your goal is to create a PREMIUM, HIGH-CONVERSION Landing Page structure.

        ${elementDefinitions}

         ### DESIGN STRATEGY (Do NOT create simple/boring pages):
        1. **Hero Section**: 
           - MUST be a "2-col" layout (Text Left, Image Right) or centered with a max-width container.
           - Use a "container" inside the "section".
           - Heading H1: Big, bold (fontSize '48px'+).
           - Subheading: Clear proposition.
           - CTA Button: High contrast color, rounded.

        2. **Features / Benefits**:
           - NEVER just a list of text.
           - Use "3-col" Grid for cards (Icon + Title + Text).
           - Use "2-col" Zig-Zag layout (Image Left/Text Right -> Text Left/Image Right).
           - Add "styles": { boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '24px', borderRadius: '16px', backgroundColor: 'white' } to cards.

        3. **Social Proof**:
           - Use a "section" with light gray background (#f8fafc).
           - Display logos or testimonials in a grid.

        4. **Visual Depth**:
           - Use GRATUITOUS but tasteful styling.
           - Add 'borderRadius' to images.
           - Add 'boxShadow' to containers.
           - Use 'gradients' for backgrounds where appropriate (e.g. Hero or Call to Action).

        5. **Copywriting**:
           - Write in **PORTUGUESE (Brasil)**.
           - Tone: Professional, Persuasive, Exciting.
           - Use bullet points (•) in text for readability.

        6. **Structure**:
           - Section 1: Hero (Dark or Gradient bg).
           - Section 2: Logos/Trust.
           - Section 3: Value Proposition (3-col Cards).
           - Section 4: Detailed Feature (2-col Zig Zag).
           - Section 5: Testimonials.
           - Section 6: FAQ.
           - Section 7: Final CTA (Gradient bg).
           - Footer.

        The Output must be a purely VALID JSON object with a single key "elements" containing the array of LPElement objects.
        MINIFY the JSON (no whitespace) to save tokens.
        Example: { "elements": [ ... ] }
        `;

        if (isEditing) {
            systemPrompt += `
             \n\nCURRENT CONTEXT: The user wants to MODIFY the existing page.
             However, for this version, please Regenerate the page incorporating the new request while keeping the general theme if possible.
             `;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06", // Supports 16k output tokens, ensuring large JSONs don't cut off
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 12000,
            response_format: { type: "json_object" },
        });

        const responseText = response.choices[0].message.content || "[]";
        // Clean markdown
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let generatedData;
        try {
            generatedData = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse AI response:", cleanedText);
            return { success: false, error: "Erro ao processar a resposta da IA." };
        }

        const generatedElements = generatedData.elements;

        if (!Array.isArray(generatedElements)) {
            return { success: false, error: "Formato de resposta inválido. Esperado array de elementos." };
        }

        // Ensure IDs are present
        const processElements = (els: any[]): LPElement[] => {
            return els.map(el => ({
                ...el,
                id: el.id || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                children: el.children ? processElements(el.children) : undefined
            }))
        }

        return {
            success: true,
            elements: processElements(generatedElements),
        }

    } catch (error) {
        console.error("Error generating LP with AI:", error)
        return {
            success: false,
            error: "Erro ao gerar Landing Page. Tente novamente."
        }
    }
}
