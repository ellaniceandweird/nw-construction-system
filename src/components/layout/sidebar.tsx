"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Building2 } from "lucide-react";

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

  return (
    <aside
      className={cn(
        "hidden md:flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Project NW
            </span>
            <span className="text-[11px] text-muted-foreground">
              Nice &amp; Weird Group
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (!collapsed) return link;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center text-sidebar-foreground/70"
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
