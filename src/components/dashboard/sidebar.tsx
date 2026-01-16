"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Plug,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layout,
  Workflow,
  MessageCircle,
  Lock,
  BadgeAlert,
  Mail,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/sidebar-context";
import { useWorkspace } from "@/context/workspace-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandSwitcher } from "./brand-switcher";
import { UsageSidebar } from "./usage-sidebar";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    locked: false,
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: Users,
    locked: false,
  },
  {
    title: "Emails",
    href: "/dashboard/emails",
    icon: Mail,
    locked: false,
  },
  {
    title: "Formulários", // Previously Projects
    href: "/dashboard/forms",
    icon: FileText,
    locked: true, // Restricted
  },
  {
    title: "Landing Pages",
    href: "/dashboard/lp",
    icon: Layout,
    locked: true, // Restricted
  },
  {
    title: "Automações",
    href: "/dashboard/automations",
    icon: Workflow,
    locked: true, // Restricted
  },
  {
    title: "Botão Flutuante",
    href: "/dashboard/whatsapp",
    icon: MessageCircle,
    locked: true, // Restricted
  },
  {
    title: "Integrações",
    href: "/dashboard/integrations",
    icon: Plug,
    locked: true, // Restricted
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const { activeWorkspace } = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();

  // Logic to determine lock state
  // Statuses that are BLOCKED: incomplete, canceled, unpaid, past_due (maybe strict?)
  // Allowed: active, trialing.
  // Note: If stripe subscription is canceled, status is 'canceled'.
  const isRestricted =
    activeWorkspace &&
    ["incomplete", "canceled", "unpaid", "past_due"].includes(
      activeWorkspace.subscription_status || "free"
    ); // Default to free if undefined, usually leads to restrict if 'free' plan is gone?
  // Wait, 'free' plan might be removed, so existing workspaces migrated to Growth?
  // If status is 'active' or 'trialing', it's fine.

  // Actually, checking exact status is better.
  const isActive =
    activeWorkspace?.subscription_status === "active" ||
    activeWorkspace?.subscription_status === "trialing";

  const handleItemClick = (
    e: React.MouseEvent,
    itemLocked: boolean,
    href: string
  ) => {
    if (!isActive && itemLocked) {
      e.preventDefault();
      router.push(`/dashboard/plans?workspace=${activeWorkspace?.id}`);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "pb-12 h-full bg-muted/10 flex flex-col border-r",
          className
        )}
      >
        <div className="space-y-4 py-4 flex-1 flex flex-col">
          <div className="px-3 py-2 flex-1 flex flex-col">
            <div
              className={cn(
                "mb-2 flex items-center gap-2 font-bold text-xl transition-all relative",
                isOpen ? "px-4" : "px-2 justify-center"
              )}
            >
              <div className="h-8 w-8 flex items-center justify-center shrink-0">
                <img
                  src="/icon-formulando.svg"
                  alt="Formulando"
                  className="w-full h-full"
                />
              </div>
              {isOpen && (
                <span
                  className="flex-1 font-brand"
                  style={{ color: "#8831d2" }}
                >
                  formulando.
                </span>
              )}
              {/* Botão de toggle no canto superior direito */}
              <div className={cn("absolute transition-all", "right-0 top-0")}>
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

            {/* Subscription Alert for Restricted Workspaces */}
            {isOpen && !isActive && activeWorkspace && (
              <div className="mx-2 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive flex flex-col gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <BadgeAlert className="h-4 w-4" />
                  <span>Assinatura Inativa</span>
                </div>
                <p className="opacity-90 leading-tight">
                  Seu plano não está ativo. Acesso limitado.
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs w-full"
                  onClick={() =>
                    router.push(
                      `/dashboard/plans?workspace=${activeWorkspace.id}`
                    )
                  }
                >
                  Regularizar Agora
                </Button>
              </div>
            )}

            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const isItemActive = pathname === item.href;
                const isLocked = !isActive && item.locked;

                const content = (
                  <>
                    <item.icon className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && (
                      <span className="flex-1 text-left">{item.title}</span>
                    )}
                    {isOpen && isLocked && (
                      <Lock className="h-3 w-3 text-muted-foreground ml-2" />
                    )}
                  </>
                );

                const button = (
                  <Button
                    key={item.href}
                    variant={isItemActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full transition-all group relative",
                      isOpen ? "justify-start" : "justify-center px-0",
                      isLocked &&
                      "opacity-70 hover:bg-destructive/10 hover:text-destructive"
                    )}
                    onClick={(e) =>
                      handleItemClick(e, !!item.locked, item.href)
                    }
                    asChild={!isLocked} // Only pass asChild if not locked, to control click better or keep link behaviour?
                  // Actually if locked, we want to handle click manually.
                  >
                    {isLocked ? (
                      // Render div/button instead of Link if locked
                      <div className="cursor-pointer flex items-center w-full">
                        {content}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center w-full"
                      >
                        {content}
                      </Link>
                    )}
                  </Button>
                );

                if (!isOpen) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="flex items-center gap-2"
                      >
                        <p>{item.title}</p>
                        {isLocked && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return button;
              })}
            </div>
            {/* Usage Box - Hide usage if locked? Or keep showing to shame them? */}
            {isOpen && <UsageSidebar />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
