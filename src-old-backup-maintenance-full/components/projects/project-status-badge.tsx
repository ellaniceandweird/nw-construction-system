import { Badge } from "@/components/ui/badge";
import type { ProjectCalculatedStatus } from "@/types";

const CONFIG: Record<ProjectCalculatedStatus, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-primary-soft text-primary" },
  active: { label: "Active", className: "bg-success-soft text-success" },
  on_hold: { label: "On Hold", className: "bg-warning-soft text-warning-foreground" },
  delayed: { label: "Delayed", className: "bg-destructive-soft text-destructive" },
  substantially_complete: { label: "Substantially Complete", className: "bg-info-soft text-info-foreground" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

export function ProjectStatusBadge({ status }: { status: ProjectCalculatedStatus }) {
  const config = CONFIG[status];
  return <Badge className={`${config.className} border-transparent`}>{config.label}</Badge>;
}
