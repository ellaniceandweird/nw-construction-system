"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { label: "Master Schedule", href: "/scheduling/master" },
  { label: "16-Week Lookahead", href: "/scheduling/lookahead-16" },
  { label: "4-Week Lookahead", href: "/scheduling/lookahead-4" },
  { label: "Weekly Schedule", href: "/scheduling/weekly" },
  { label: "Daily Work Plan", href: "/scheduling/daily" },
];

export function SchedulingTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-4 flex flex-wrap gap-1 border-b border-border print:hidden">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
