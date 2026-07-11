import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-success-soft text-success",
  in_progress: "bg-primary-soft text-primary",
  delayed: "bg-destructive-soft text-destructive",
  blocked: "bg-destructive-soft text-destructive",
  not_started: "bg-muted text-muted-foreground",
  ready: "bg-info-soft text-info-foreground",
};

export function ProjectSchedulePreview({ projectId }: { projectId: string }) {
  const activities = MOCK_ACTIVITIES.filter((a) => a.projectId === projectId).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Schedule</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No scheduled activities for this project yet.
          </p>
        )}
        {activities.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-foreground">{a.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">{a.percentComplete}%</span>
              <Badge className={`${STATUS_CLASS[a.status] ?? ""} border-transparent`}>
                {a.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        ))}
        <Link
          href="/scheduling/master"
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          View full schedule
        </Link>
      </CardContent>
    </Card>
  );
}
