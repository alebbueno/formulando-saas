
import { FormElements } from "@/components/builder/form-elements"
import { FormElementInstance } from "@/context/builder-context"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FormSubmitComponent } from "@/components/form-submit"

export default async function SubmitPage({
    params,
}: {
    params: Promise<{ formUrl: string }>
}) {
    const resolvedParams = await params
    const { formUrl } = resolvedParams
    const supabase = await createClient()

    // Verify if it's a valid UUID (since we are using ID for now)
    // or just try to fetch.

    const { data: project } = await supabase
        .from("projects")
        .select("content, name, settings")
        .eq("id", formUrl)
        .single()

    if (!project) {
        return notFound()
    }

    // Track visit (async, don't block page load)
    const { incrementVisit } = await import("@/actions/form")
    incrementVisit(formUrl).catch((err: unknown) => console.error("Failed to track visit:", err))



    const formContent = project.content as FormElementInstance[]

    if (!formContent) {
        return <div>Formulário vazio</div>
    }

    // Default settings fallback (mirroring builder-context to avoid server/client import issues)
    const settings = project.settings || {
        design: {
            theme: {
                page: { backgroundColor: "#ffffff", textColor: "#000000" },
                inputs: { backgroundColor: "#ffffff", textColor: "#000000", borderColor: "#e2e8f0", borderRadius: 4 },
                buttons: { backgroundColor: "#2563EB", textColor: "#ffffff", borderRadius: 4 },
                labels: { textColor: "#000000" }
            }
        }
    };

    const theme = settings.design?.theme || {};

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen p-4 custom-form-theme transition-colors duration-300"
            style={{
                backgroundColor: theme.page?.backgroundColor || '#ffffff',
                color: theme.page?.textColor || '#000000',
                // @ts-ignore
                "--input-bg": theme.inputs?.backgroundColor || '#ffffff',
                "--input-border": theme.inputs?.borderColor || '#e2e8f0',
                "--input-radius": `${theme.inputs?.borderRadius || 4}px`,
                "--input-text": theme.inputs?.textColor || '#000000',
                "--label-text": theme.labels?.textColor || '#000000',
                "--btn-bg": theme.buttons?.backgroundColor || '#2563EB',
                "--btn-text": theme.buttons?.textColor || '#ffffff',
                "--btn-radius": `${theme.buttons?.borderRadius || 4}px`,
            } as React.CSSProperties}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-form-theme input, 
                .custom-form-theme textarea, 
                .custom-form-theme select {
                    background-color: var(--input-bg) !important;
                    border-color: var(--input-border) !important;
                    border-radius: var(--input-radius) !important;
                    color: var(--input-text) !important;
                }
                .custom-form-theme label,
                .custom-form-theme span,
                .custom-form-theme p {
                    color: var(--label-text) !important;
                }
                .custom-form-theme button.ui-submit-btn {
                    background-color: var(--btn-bg) !important;
                    color: var(--btn-text) !important;
                    border-radius: var(--btn-radius) !important;
                }
            `}} />
            <div className="max-w-[800px] w-full bg-transparent p-8">
                <FormSubmitComponent
                    formUrl={formUrl}
                    content={formContent}
                    buttonSettings={{
                        text: settings.design?.buttonText || "Enviar"
                    }}
                />
            </div>
        </div>
    )
}
