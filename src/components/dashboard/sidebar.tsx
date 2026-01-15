"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, Plug, Plus, ChevronLeft, ChevronRight, FileText, Layout, Workflow, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/context/sidebar-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { BrandSwitcher } from "./brand-switcher"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Leads",
        href: "/dashboard/leads",
        icon: Users,
    },
    {
        title: "Formulários", // Previously Projects
        href: "/dashboard/forms",
        icon: FileText,
    },
    {
        title: "Landing Pages",
        href: "/dashboard/lp",
        icon: Layout,
    },
    {
        title: "Automações",
        href: "/dashboard/automations",
        icon: Workflow,
    },
    {
        title: "Botão Flutuante",
        href: "/dashboard/whatsapp",
        icon: MessageCircle,
    },
    {
        title: "Integrações",
        href: "/dashboard/integrations",
        icon: Plug,
    },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const { isOpen, toggle } = useSidebar()
    const pathname = usePathname()

    return (
        <TooltipProvider>
            <div className={cn("pb-12 h-full bg-muted/10 flex flex-col", className)}>
                <div className="space-y-4 py-4 flex-1">
                    <div className="px-3 py-2">
                        <div className={cn(
                            "mb-2 flex items-center gap-2 font-bold text-xl transition-all relative",
                            isOpen ? "px-4" : "px-2 justify-center"
                        )}>
                            <div className="h-8 w-8 flex items-center justify-center shrink-0">
                                <img 
                                    src="/icon-formulando.svg" 
                                    alt="Formulando" 
                                    className="w-full h-full"
                                />
                            </div>
                            {isOpen && <span className="flex-1 font-brand" style={{ color: '#8831d2' }}>formulando.</span>}
                            {/* Botão de toggle no canto superior direito */}
                            <div className={cn(
                                "absolute transition-all",
                                "right-0 top-0"
                            )}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:bg-accent -mr-2"
                                            onClick={toggle}
                                        >
                                            {isOpen ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{isOpen ? "Fechar sidebar" : "Abrir sidebar"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        {isOpen && (
                            <div className="px-2 mb-4">
                                <BrandSwitcher />
                            </div>
                        )}
                        <div className="space-y-1">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href
                                const button = (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full transition-all",
                                            isOpen ? "justify-start" : "justify-center px-0"
                                        )}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            <item.icon className={cn("h-4 w-4", isOpen && "mr-2")} />
                                            {isOpen && item.title}
                                        </Link>
                                    </Button>
                                )

                                if (!isOpen) {
                                    return (
                                        <Tooltip key={item.href}>
                                            <TooltipTrigger asChild>
                                                {button}
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                }

                                return button
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
