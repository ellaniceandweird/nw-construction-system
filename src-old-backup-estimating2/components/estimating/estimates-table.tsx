"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useEstimates } from "@/hooks/use-estimates";
import { deleteEstimate } from "@/lib/estimating/estimate-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstimateEditDialog } from "@/components/estimating/estimate-edit-dialog";
import type { Estimate } from "@/types/estimating";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-warning-soft text-warning-foreground",
  client_review: "bg-info-soft text-info-foreground",
  approved: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
  superseded: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function EstimatesTable() {
  const estimates = useEstimates();
  const [editing, setEditing] = React.useState<Estimate | null>(null);
  const [creating, setCreating] = React.useState(false);

  const sorted = [...estimates].sort(
    (a, b) => new Date(b.estimateDate).getTime() - new Date(a.estimateDate).getTime()
  );

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> New Estimate
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Estimate Number</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Estimator</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
              <th className="px-4 py-3 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{e.estimateNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(e.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.estimator}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.estimateDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">Rev {e.revision}</td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(e.totalEstimatedCost)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[e.estimateStatus] ?? ""} border-transparent`}>
                    {e.estimateStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(e)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteEstimate(e.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                  No estimates yet — create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <EstimateEditDialog estimate={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <EstimateEditDialog estimate={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
