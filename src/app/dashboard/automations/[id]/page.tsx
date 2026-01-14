import { createClient } from "@/lib/supabase/server"
import { FlowEditor } from "@/components/automations/flow-editor"
import { redirect } from "next/navigation"

export default async function AutomationEditorPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    const { id } = resolvedParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: automation, error } = await supabase
        .from("automations")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !automation) {
        return <div>Automação não encontrada</div>
    }

    return (
        <div className="h-[calc(100vh-64px)] -m-6 md:-m-8 flex flex-col">
            <FlowEditor initialData={automation} />
        </div>
    )
}
