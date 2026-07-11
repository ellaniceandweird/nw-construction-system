import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { PrintButton } from "@/components/shared/print-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { generateLookahead16 } from "@/lib/scheduling/generate";

const TODAY = new Date("2026-07-10");

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Lookahead16Page() {
  const items = generateLookahead16(MOCK_ACTIVITIES, TODAY);

  return (
    <>
      <PageHeader
        title="16-Week Lookahead"
        description="Every activity planned to start or finish in the next 16 weeks — generated automatically from the Master Schedule, not edited here."
        actions={<PrintButton />}
      />
      <SchedulingTabs />

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">Finish</th>
              <th className="px-4 py-3 font-medium">Crew</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const activity = MOCK_ACTIVITIES.find((a) => a.id === item.activityId);
              const project = MOCK_PROJECTS.find((p) => p.id === activity?.projectId);
              return (
                <tr key={item.activityId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {project?.projectName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.description}
                    {item.isDelayed && (
                      <Badge variant="destructive" className="ml-2">
                        Delayed
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.plannedStart)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.plannedFinish)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.assignedCrew ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentComplete} className="w-16" />
                      <span className="text-xs text-muted-foreground">{item.percentComplete}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.aiRiskIndicator ? (
                      <Badge
                        className={
                          item.aiRiskIndicator === "high"
                            ? "bg-destructive-soft text-destructive border-transparent"
                            : item.aiRiskIndicator === "medium"
                            ? "bg-warning-soft text-warning-foreground border-transparent"
                            : "bg-success-soft text-success border-transparent"
                        }
                      >
                        {item.aiRiskIndicator}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No activities fall within the next 16 weeks.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
