"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, Menu } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [open, setOpen] = React.useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex h-16 items-center gap-2.5 px-5 bg-sidebar">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
              NICE &amp; WEIRD
            </span>
            <span className="text-[11px] text-sidebar-muted">
              Construction Operations
            </span>
          </div>
        </div>
        <div className="bg-sidebar flex-1 flex flex-col">
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
