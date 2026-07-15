"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

function toLabel(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { href, label: toLabel(segment) };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className={cn("font-medium text-foreground")}>
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
