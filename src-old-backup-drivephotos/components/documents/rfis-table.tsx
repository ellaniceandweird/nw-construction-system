"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { useRfis } from "@/hooks/use-rfis";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RfiEditDialog } from "@/components/documents/rfi-edit-dialog";
import type { RFI } from "@/types/documents";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info-soft text-info-foreground",
  under_review: "bg-warning-soft text-warning-foreground",
  answered: "bg-success-soft text-success",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive-soft text-destructive",
};
const PRIORITY_CLASS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info-soft text-info-foreground",
  high: "bg-warning-soft text-warning-foreground",
  critical: "bg-destructive-soft text-destructive",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function RfisTable() {
  const rfis = useRfis();
  const [editing, setEditing] = React.useState<RFI | null>(null);
  const [creating, setCreating] = React.useState(false);
  const sorted = [...rfis].sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Requests for Information — questions that came up during the work and need a
          documented answer, whether from the field, an owner, or a design professional.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New RFI</Button>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">RFI #</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Needed By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{r.rfiNumber}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">{r.subject}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(r.projectId)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${PRIORITY_CLASS[r.priority]} border-transparent`}>{r.priority}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.requiredResponseDate)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[r.rfiStatus]} border-transparent`}>{r.rfiStatus.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Pencil className="size-3.5" /></Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No RFIs yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <RfiEditDialog rfi={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <RfiEditDialog rfi={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
