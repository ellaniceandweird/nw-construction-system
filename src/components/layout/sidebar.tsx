"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [collapsed, setCollapsed] = React.useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const activeParentHref = visibleItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  )?.href;

  const [openGroup, setOpenGroup] = React.useState<string | null>(
    activeParentHref ?? null
  );

  return (
    <aside
      className={cn(
        "hidden md:flex h-svh shrink-0 flex-col bg-sidebar transition-[width] duration-200 print:hidden",
        collapsed ? "w-[68px]" : "w-72"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 px-5",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
          <Image src="/nice-and-weird-logo.png" alt="Nice & Weird Group logo" width={36} height={36} className="object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
              NICE &amp; WEIRD
            </span>
            <span className="text-[11px] text-sidebar-muted">
              Construction Operations
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 scrollbar-thin">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isOpen = openGroup === item.href;

          const row = (
            <div
              key={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center"
              )}
            >
              <Link
                href={item.href}
                onClick={() => hasChildren && setOpenGroup(isOpen ? null : item.href)}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
              {!collapsed && hasChildren && (
                <button
                  aria-label={isOpen ? "Collapse section" : "Expand section"}
                  onClick={() => setOpenGroup(isOpen ? null : item.href)}
                  className="px-2 py-2.5 text-sidebar-muted hover:text-sidebar-accent-foreground"
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>
          );

          return (
            <div key={item.href}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{row}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                row
              )}
              {!collapsed && hasChildren && isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-4">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-muted hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
