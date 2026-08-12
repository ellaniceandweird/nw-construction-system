"use client";

import * as React from "react";
import { Sparkles, FileText, ArrowUpDown } from "lucide-react";

import { useForecast } from "@/hooks/use-forecast";
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
import { RfqCreateDialog } from "@/components/procurement/rfq-create-dialog";
import type { ForecastRow } from "@/hooks/use-forecast";

const URGENCY_CLASS: Record<string, string> = {
  overdue: "bg-destructive-soft text-destructive",
  urgent: "bg-warning-soft text-warning-foreground",
  upcoming: "bg-info-soft text-info-foreground",
  planned: "bg-muted text-muted-foreground",
};

const URGENCY_LABEL: Record<string, string> = {
  overdue: "Overdue",
  urgent: "Urgent",
  upcoming: "Upcoming",
  planned: "Planned",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ForecastTable() {
  const allRows = useForecast();
  const [rfqPrefill, setRfqPrefill] = React.useState<{ projectId: string; materialList: string } | null>(
    null
  );
  const [urgencyFilter, setUrgencyFilter] = React.useState("all");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"neededby_asc" | "neededby_desc">("neededby_asc");

  const projectOptions = [...new Map(allRows.map((r) => [r.projectId, r.projectName])).entries()];

  const filtered = allRows.filter((r) => {
    const matchesUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;
    const matchesProject = projectFilter === "all" || r.projectId === projectFilter;
    return matchesUrgency && matchesProject;
  });
  const rows = [...filtered].sort((a, b) =>
    sortBy === "neededby_asc" ? a.neededBy.localeCompare(b.neededBy) : b.neededBy.localeCompare(a.neededBy)
  );

  return (
    <>
      <div className="mb-3 flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Auto-detected from your live Master Schedule by scanning activity names for
          trade/material keywords (a rule-based classifier, not a live AI model call —
          same approach the app already uses for schedule risk flags). Quantities come
          from Estimating &gt; Takeoff when a matching entry exists there; otherwise
          it&apos;s an illustrative per-activity placeholder. &quot;Request Quote&quot; creates
          the RFQ — head to the RFQs tab afterward and click the mail icon to preview
          and send the actual vendor invite email.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectOptions.map(([id, name]) => (<SelectItem key={id} value={id}>{name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Urgency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="neededby_asc">Needed By (Soonest)</SelectItem>
            <SelectItem value="neededby_desc">Needed By (Latest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{rows.length} of {allRows.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Needed By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source Activities</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: ForecastRow) => (
              <tr key={row.key} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.projectName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.quantity.toLocaleString()} {row.unit}
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    {row.quantitySource === "takeoff" ? "· takeoff" : "· illustrative"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(row.neededBy)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${URGENCY_CLASS[row.urgency]} border-transparent`}>
                    {URGENCY_LABEL[row.urgency]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">
                  {row.sourceActivityNames.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRfqPrefill({
                        projectId: row.projectId,
                        materialList: `${row.label} — ${row.quantity.toLocaleString()} ${row.unit} (needed by ${formatDate(row.neededBy)})`,
                      })
                    }
                  >
                    <FileText className="size-3.5" /> Request Quote
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No upcoming material needs detected in the current schedule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <RfqCreateDialog
        open={!!rfqPrefill}
        onOpenChange={(open) => !open && setRfqPrefill(null)}
        initialProjectId={rfqPrefill?.projectId}
        initialMaterialList={rfqPrefill?.materialList}
      />
    </>
  );
}
