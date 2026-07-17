import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DashboardStatus =
  | "on_track"
  | "at_risk"
  | "behind_schedule"
  | "over_budget"
  | "due_soon"
  | "upcoming"
  | "completed"
  | "pending_approval"
  | "information"
  | "overdue";

const STATUS_CONFIG: Record<DashboardStatus, { label: string; className: string }> = {
  on_track: { label: "On Track", className: "bg-success-soft text-success" },
  at_risk: { label: "At Risk", className: "bg-warning-soft text-warning-foreground" },
  behind_schedule: { label: "Behind Schedule", className: "bg-destructive-soft text-destructive" },
  over_budget: { label: "Over Budget", className: "bg-destructive-soft text-destructive" },
  due_soon: { label: "Due Soon", className: "bg-warning-soft text-warning-foreground" },
  upcoming: { label: "Upcoming", className: "bg-primary-soft text-primary" },
  completed: { label: "Completed", className: "bg-success-soft text-success" },
  pending_approval: { label: "Pending Approval", className: "bg-info-soft text-info-foreground" },
  information: { label: "Information", className: "bg-info-soft text-info-foreground" },
  overdue: { label: "Overdue", className: "bg-destructive-soft text-destructive" },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: DashboardStatus;
  label?: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={cn(config.className, "border-transparent", className)}>
      {label ?? config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
