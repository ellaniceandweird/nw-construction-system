"use client";

import * as React from "react";
import { Pencil, Plus, ChevronRight, Upload, Sparkles } from "lucide-react";

import { useEstimates } from "@/hooks/use-estimates";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstimateEditDialog } from "@/components/estimating/estimate-edit-dialog";
import { EstimateBudgetSheet } from "@/components/estimating/estimate-budget-sheet";
import { ImportEstimateDialog } from "@/components/estimating/import-estimate-dialog";
import { DrawingEstimateDialog } from "@/components/estimating/drawing-estimate-dialog";
import { ProposalPrintSheet } from "@/components/estimating/proposal-print-sheet";
import { PrintButton } from "@/components/shared/print-button";
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
  const [importing, setImporting] = React.useState(false);
  const [generatingFromDrawing, setGeneratingFromDrawing] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...estimates].sort((a, b) => new Date(b.estimateDate).getTime() - new Date(a.estimateDate).getTime());

  return (
    <>
      <div className="mb-3 flex flex-wrap justify-end gap-2 print:hidden">
        <Button size="sm" variant="outline" onClick={() => setGeneratingFromDrawing(true)}>
          <Sparkles className="size-3.5" /> Generate from Drawing
        </Button>
        <Button size="sm" variant="outline" onClick={() => setImporting(true)}>
          <Upload className="size-3.5" /> Import Estimate
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> New Estimate
        </Button>
      </div>

      <Card className="overflow-x-auto py-0 print:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Estimate Number</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const isExpanded = expandedId === e.id;
              return (
                <React.Fragment key={e.id}>
                  <tr className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary hover:underline"
                        onClick={() => setExpandedId(isExpanded ? null : e.id)}
                      >
                        <ChevronRight className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {projectName(e.projectId)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.estimateNumber}</td>
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
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="bg-muted/20 px-4 pb-4 pt-1">
                        <div className="mb-2 flex justify-end print:hidden">
                          <PrintButton label="Print Proposal" />
                        </div>
                        <div className="print:hidden">
                          <EstimateBudgetSheet estimate={e} projectName={projectName(e.projectId)} />
                        </div>
                        <ProposalPrintSheet estimate={e} projectName={projectName(e.projectId)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No estimates yet — create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <EstimateEditDialog estimate={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <EstimateEditDialog estimate={null} open={creating} onOpenChange={setCreating} />
      <ImportEstimateDialog open={importing} onOpenChange={setImporting} />
      <DrawingEstimateDialog open={generatingFromDrawing} onOpenChange={setGeneratingFromDrawing} />
    </>
  );
}
