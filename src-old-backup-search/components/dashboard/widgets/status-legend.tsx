import { STATUS_CONFIG, type DashboardStatus } from "@/components/shared/status-badge";

const LEGEND_ORDER: DashboardStatus[] = [
  "on_track",
  "at_risk",
  "behind_schedule",
  "over_budget",
  "due_soon",
  "upcoming",
  "completed",
  "pending_approval",
  "information",
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-1 py-4 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Status Legend:</span>
      {LEGEND_ORDER.map((key) => {
        const config = STATUS_CONFIG[key];
        return (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${config.className.split(" ")[0]}`} />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
