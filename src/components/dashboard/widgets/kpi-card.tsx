import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "destructive" | "warning" | "success" | "info" | "primary";
  href: string;
}

const TONE_CLASSES: Record<KpiCardProps["tone"], string> = {
  destructive: "bg-destructive-soft text-destructive",
  warning: "bg-warning-soft text-warning-foreground",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info-foreground",
  primary: "bg-primary-soft text-primary",
};

export function KpiCard({ label, value, icon: Icon, tone, href }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            TONE_CLASSES[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium leading-tight text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold leading-none text-foreground">
            {value}
          </span>
          <Link
            href={href}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
