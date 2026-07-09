import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Standard page header used at the top of every module screen.
 * Provides breadcrumbs, an H1 title, optional description, and a slot for
 * primary actions (e.g. "New Project", "Export", "Publish Schedule").
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 pb-5", className)}>
      <Breadcrumbs />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
