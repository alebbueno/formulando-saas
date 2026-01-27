import { redirect } from "next/navigation"
import { getActiveWorkspace } from "@/lib/get-active-workspace"
import ClientLayout from "./client-layout"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Check workspace status serverside
    const { allWorkspaces } = await getActiveWorkspace() || {}

    // 2. Redirect if needed
    if (!allWorkspaces || allWorkspaces.length === 0) {
        redirect("/onboarding")
    }

    // 3. Render client layout
    return (
        <ClientLayout>
            {children}
        </ClientLayout>
    )
}
