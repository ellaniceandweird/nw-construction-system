"use client";
import { ClipboardList, Wrench, FolderKanban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getRecentActivityFeed } from "@/lib/dashboard/metrics";
import { cn } from "@/lib/utils";

const ICONS = { log: ClipboardList, maintenance: Wrench, project: FolderKanban };
const ICON_TONE = {
  log: "text-primary",
  maintenance: "text-warning-foreground",
  project: "text-success",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityLogTable() {
  const items = getRecentActivityFeed(200);

  return (
    <Card className="overflow-x-auto py-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Activity</th>
            <th className="px-4 py-3 font-medium">Property / Project</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3">
                  <Icon className={cn("size-4", ICON_TONE[item.icon])} />
                </td>
                <td className="px-4 py-3 text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.subDescription ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.date)}</td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Nothing logged yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
