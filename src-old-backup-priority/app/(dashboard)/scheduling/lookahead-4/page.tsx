import { CheckCircle2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { generateLookahead4 } from "@/lib/scheduling/generate";
import type { WorkReadinessStatus } from "@/types/scheduling";

const TODAY = new Date("2026-07-10");

const STATUS_CONFIG: Record<WorkReadinessStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-success-soft text-success" },
  nearly_ready: { label: "Nearly Ready", className: "bg-warning-soft text-warning-foreground" },
  at_risk: { label: "At Risk", className: "bg-warning-soft text-warning-foreground" },
  blocked: { label: "Blocked", className: "bg-destructive-soft text-destructive" },
};

function ReadinessCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {ok ? (
        <CheckCircle2 className="size-3.5 text-success" />
      ) : (
        <XCircle className="size-3.5 text-destructive" />
      )}
      <span className={ok ? "text-muted-foreground" : "text-destructive"}>{label}</span>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Lookahead4Page() {
  const items = generateLookahead4(MOCK_ACTIVITIES, TODAY);

  return (
    <>
      <PageHeader
        title="4-Week Lookahead"
        description="Work readiness for everything starting in the next 4 weeks — generated from the Master Schedule."
      />
      <SchedulingTabs />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const activity = MOCK_ACTIVITIES.find((a) => a.id === item.activityId);
          const project = MOCK_PROJECTS.find((p) => p.id === activity?.projectId);
          const config = STATUS_CONFIG[item.workStatus];

          return (
            <Card key={item.activityId}>
              <CardHeader>
                <CardTitle className="text-sm">{item.description}</CardTitle>
                <Badge className={`${config.className} border-transparent`}>{config.label}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  {project?.projectName} · {formatDate(item.plannedStart)} –{" "}
                  {formatDate(item.plannedFinish)}
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                  <ReadinessCheck ok={item.readiness.materialReady} label="Materials" />
                  <ReadinessCheck ok={item.readiness.crewAvailable} label="Crew" />
                  <ReadinessCheck ok={item.readiness.equipmentAvailable} label="Equipment" />
                  <ReadinessCheck ok={item.readiness.dependenciesComplete} label="Dependencies" />
                </div>
                {item.crewAssigned && (
                  <p className="pt-1 text-xs text-muted-foreground">Crew: {item.crewAssigned}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted-foreground">
            No activities fall within the next 4 weeks.
          </p>
        )}
      </div>
    </>
  );
}
