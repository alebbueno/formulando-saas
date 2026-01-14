"use client"

import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { WorkspaceProvider } from "@/context/workspace-context"
import { cn } from "@/lib/utils"

import { usePathname } from "next/navigation"


function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { isOpen } = useSidebar()
    const pathname = usePathname()
    const isAccountPage = pathname?.includes("/dashboard/account")
    const isPlansPage = pathname === "/dashboard/plans"

    if (isPlansPage) {
        return (
            <div className="min-h-screen bg-background overflow-y-auto">
                {children}
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {!isAccountPage && (
                <aside className={cn(
                    "hidden flex-col border-r md:flex transition-all duration-300",
                    isOpen ? "w-64" : "w-16"
                )}>
                    <Sidebar className="bg-background" />
                </aside>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <WorkspaceProvider>
            <SidebarProvider>
                <DashboardLayoutContent>
                    {children}
                </DashboardLayoutContent>
            </SidebarProvider>
        </WorkspaceProvider>
    )
}
