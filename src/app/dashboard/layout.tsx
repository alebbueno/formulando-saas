"use client"

import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { cn } from "@/lib/utils"

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { isOpen } = useSidebar()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <aside className={cn(
                "hidden flex-col border-r md:flex transition-all duration-300",
                isOpen ? "w-64" : "w-16"
            )}>
                <Sidebar className="bg-background" />
            </aside>
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
        <SidebarProvider>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </SidebarProvider>
    )
}
