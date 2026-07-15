"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { useSubmittals } from "@/hooks/use-submittals";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmittalEditDialog } from "@/components/documents/submittal-edit-dialog";
import type { Submittal } from "@/types/documents";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-info-soft text-info-foreground",
  approved: "bg-success-soft text-success",
  approved_as_noted: "bg-success-soft text-success",
  revise_and_resubmit: "bg-warning-soft text-warning-foreground",
  rejected: "bg-destructive-soft text-destructive",
  closed: "bg-muted text-muted-foreground",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function SubmittalsTable() {
  const submittals = useSubmittals();
  const [editing, setEditing] = React.useState<Submittal | null>(null);
  const [creating, setCreating] = React.useState(false);
  const sorted = [...submittals].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Material/product approvals before installation — samples, spec sheets, or color
          selections that need sign-off first.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New Submittal</Button>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Submittal #</th>
              <th className="px-4 py-3 font-medium">Material / Product</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Manufacturer</th>
              <th className="px-4 py-3 font-medium">Required By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{s.submittalNumber}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">{s.material}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(s.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.manufacturer ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(s.requiredDate)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[s.submittalStatus]} border-transparent`}>{s.submittalStatus.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Pencil className="size-3.5" /></Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No submittals yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <SubmittalEditDialog submittal={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <SubmittalEditDialog submittal={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
