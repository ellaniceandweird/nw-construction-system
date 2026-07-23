"use client";

import * as React from "react";
import { Pencil, Plus, ChevronRight, Upload, Sparkles, Printer, ArrowUpDown } from "lucide-react";

import { useEstimates } from "@/hooks/use-estimates";
import { useProjects } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstimateEditDialog } from "@/components/estimating/estimate-edit-dialog";
import { EstimateBudgetSheet } from "@/components/estimating/estimate-budget-sheet";
import { ImportEstimateDialog } from "@/components/estimating/import-estimate-dialog";
import { DrawingEstimateDialog } from "@/components/estimating/drawing-estimate-dialog";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { buildEstimatesListHtml, buildEstimateDetailHtml } from "@/lib/estimating/print-content";
import type { Estimate } from "@/types/estimating";
import type { Project } from "@/types/project";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-warning-soft text-warning-foreground",
  owner_review: "bg-info-soft text-info-foreground",
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
function projectName(id: string, projects: Project[]) {
  return projects.find((p) => p.id === id)?.projectName ?? id;
}

export function EstimatesTable() {
  const projects = useProjects();
  const estimates = useEstimates();
  const [editing, setEditing] = React.useState<Estimate | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [generatingFromDrawing, setGeneratingFromDrawing] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"date_desc" | "date_asc">("date_desc");

  const filtered = estimates.filter((e) => statusFilter === "all" || e.estimateStatus === statusFilter);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "date_desc"
      ? new Date(b.estimateDate).getTime() - new Date(a.estimateDate).getTime()
      : new Date(a.estimateDate).getTime() - new Date(b.estimateDate).getTime()
  );

  function handlePrintList() {
    openPrintWindow("Estimates", buildEstimatesListHtml(sorted, (id) => projectName(id, projects)));
  }
  function handlePrintEstimate(e: Estimate) {
    openPrintWindow(`Estimate ${e.estimateNumber}`, buildEstimateDetailHtml(e, projectName(e.projectId, projects)));
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={handlePrintList}>
          <Printer className="size-3.5" /> Print
        </Button>
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

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="internal_review">Internal Review</SelectItem>
            <SelectItem value="owner_review">Owner Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Date (Newest)</SelectItem>
            <SelectItem value="date_asc">Date (Oldest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {estimates.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
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
                        {projectName(e.projectId, projects)}
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
                        <div className="mb-2 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => handlePrintEstimate(e)}>
                            <Printer className="size-3.5" /> Print Estimate
                          </Button>
                        </div>
                        <EstimateBudgetSheet estimate={e} projectName={projectName(e.projectId, projects)} />
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
