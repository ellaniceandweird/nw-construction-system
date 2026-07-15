import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getScheduleOverview } from "@/lib/dashboard/metrics";
import { cn } from "@/lib/utils";

const DOT_CLASSES: Record<string, string> = {
  "On Schedule": "bg-success",
  "At Risk": "bg-warning",
  "Behind Schedule": "bg-destructive",
  "Not Started": "bg-muted-foreground/40",
  Completed: "bg-primary",
};

export function ScheduleOverviewWidget() {
  const buckets = getScheduleOverview();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className={cn("size-2 rounded-full", DOT_CLASSES[b.label])} />
              {b.label}
            </span>
            <span className="font-semibold text-foreground">{b.count}</span>
          </div>
        ))}
        <Link
          href="/scheduling/master"
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          View schedule
        </Link>
      </CardContent>
    </Card>
  );
}
