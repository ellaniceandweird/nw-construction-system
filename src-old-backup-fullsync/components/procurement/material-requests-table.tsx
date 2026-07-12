import { MOCK_MATERIAL_REQUESTS } from "@/lib/data/mock/material-requests";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
  rfq_issued: "bg-info-soft text-info-foreground",
  po_issued: "bg-primary-soft text-primary",
  closed: "bg-muted text-muted-foreground",
};

const PRIORITY_CLASS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info-soft text-info-foreground",
  high: "bg-warning-soft text-warning-foreground",
  critical: "bg-destructive-soft text-destructive",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MaterialRequestsTable() {
  const sorted = [...MOCK_MATERIAL_REQUESTS].sort(
    (a, b) => new Date(a.requiredOnSiteDate).getTime() - new Date(b.requiredOnSiteDate).getTime()
  );

  return (
    <Card className="overflow-x-auto py-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">MR Number</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Needed By</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((mr) => {
            const project = MOCK_PROJECTS.find((p) => p.id === mr.projectId);
            return (
              <tr key={mr.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{mr.mrNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {mr.lineItems[0]?.description}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(mr.requiredOnSiteDate)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${PRIORITY_CLASS[mr.priority]} border-transparent`}>
                    {mr.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[mr.requestStatus] ?? ""} border-transparent`}>
                    {mr.requestStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
