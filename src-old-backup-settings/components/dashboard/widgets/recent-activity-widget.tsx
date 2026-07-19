import Link from "next/link";
import { ClipboardList, Wrench, FolderKanban } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getRecentActivityFeed } from "@/lib/dashboard/metrics";
import { cn } from "@/lib/utils";

const ICONS = { log: ClipboardList, maintenance: Wrench, project: FolderKanban };
const ICON_TONE = {
  log: "text-primary",
  maintenance: "text-warning-foreground",
  project: "text-success",
};

function timeAgo(date: Date, now: Date) {
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function RecentActivityWidget() {
  const items = getRecentActivityFeed(6);
  const now = new Date("2026-07-10");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-2.5 text-sm">
              <Icon className={cn("mt-0.5 size-3.5 shrink-0", ICON_TONE[item.icon])} />
              <div className="flex flex-1 flex-col">
                <span className="text-foreground">{item.description}</span>
                {item.subDescription && (
                  <span className="text-xs text-muted-foreground">
                    {item.subDescription}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(item.date, now)}
              </span>
            </div>
          );
        })}
        <Link
          href="/dashboard/activity-log"
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          View all activity
        </Link>
      </CardContent>
    </Card>
  );
}
