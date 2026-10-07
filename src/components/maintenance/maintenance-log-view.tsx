"use client";

import * as React from "react";
import { CheckCircle2, Wrench, Search, ArrowUpDown, Printer, Upload, ClipboardCheck } from "lucide-react";

import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openPrintWindow, escapeHtml } from "@/lib/estimating/print-window";
import { DASHBOARD_COLORS } from "@/lib/dashboard/pastel-colors";
import { ImportMaintenanceLogDialog } from "@/components/maintenance/import-maintenance-log-dialog";
import type { MaintenanceLogEntry } from "@/lib/maintenance/maintenance-log-store";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Staff-report entries record the day the work was done, not a time of day, so showing a clock time on them would be misleading. */
function formatEntryTime(entry: MaintenanceLogEntry) {
  if (entry.type !== "staff_report") return formatTimestamp(entry.timestamp);
  return new Date(entry.timestamp).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function entryStyle(type: MaintenanceLogEntry["type"]) {
  if (type === "task_completed") return { colors: DASHBOARD_COLORS.good, label: "Long Term Maintenance" };
  if (type === "equipment_serviced") return { colors: DASHBOARD_COLORS.info, label: "Recurring Maintenance" };
  return { colors: DASHBOARD_COLORS.secondary, label: "Staff Report" };
}

export function MaintenanceLogView() {
  const allEntries = useMaintenanceLog();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest">("newest");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [importing, setImporting] = React.useState(false);

  const propertyNames = Array.from(new Set(allEntries.map((e) => e.propertyName).filter(Boolean))) as string[];

  const filtered = allEntries.filter((e) => {
    const matchesSearch = !search || `${e.description} ${e.propertyName ?? ""} ${e.detail}`.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === "all" || e.propertyName === propertyFilter;
    return matchesSearch && matchesProperty;
  });
  const entries = [...filtered].sort((a, b) =>
    sortBy === "newest" ? b.timestamp.localeCompare(a.timestamp) : a.timestamp.localeCompare(b.timestamp)
  );

  function handlePrint() {
    const rows = entries
      .map((entry) => {
        const { colors, label: typeLabel } = entryStyle(entry.type);
        return `
          <tr>
            <td>${formatEntryTime(entry)}</td>
            <td>${escapeHtml(entry.propertyName ?? "—")}</td>
            <td><span style="background:${colors.bg};color:${colors.text};padding:2px 8px;border-radius:4px;font-size:10px;">${typeLabel}</span></td>
            <td>${escapeHtml(entry.description)}</td>
            <td>${escapeHtml(entry.detail ?? "—")}</td>
          </tr>`;
      })
      .join("");

    openPrintWindow(
      "Property Maintenance Log",
      `
      <div class="header"><h1>Property Maintenance Log</h1></div>
      <p>${entries.length} entr${entries.length === 1 ? "y" : "ies"}${propertyFilter !== "all" ? ` — ${escapeHtml(propertyFilter)}` : ""}</p>
      <table>
        <thead>
          <tr><th>Date</th><th>Property</th><th>Source</th><th>Description</th><th>Detail</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5">No entries match the current filters.</td></tr>'}</tbody>
      </table>
      `,
      "Property Maintenance Management"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This log fills in from three sources: Long Term Maintenance tasks marked complete,
        Recurring Maintenance Last Completed dates (by hand, the DONE button, or an import),
        and staff completion reports you import here.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search log…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <SearchableSelect
          className="w-56"
          value={propertyFilter}
          placeholder="All properties"
          searchPlaceholder="Type a property name…"
          leadingOptions={[{ value: "all", label: "All properties" }]}
          options={propertyNames.map((p) => ({ value: p, label: p }))}
          onChange={setPropertyFilter}
        />
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setImporting(true)}>
          <Upload className="size-3.5" /> Import Staff Report
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="size-3.5" /> Print
        </Button>
        <span className="text-sm text-muted-foreground">{entries.length} of {allEntries.length}</span>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {entries.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {allEntries.length === 0
                ? "No completions logged yet. Mark a task complete or update an equipment's Last Completed date to see it appear here."
                : "No entries match your search."}
            </p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              {entry.type === "task_completed" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              ) : entry.type === "staff_report" ? (
                <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Wrench className="mt-0.5 size-4 shrink-0 text-primary" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{entry.description}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.propertyName ?? "—"} · {entry.detail}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatEntryTime(entry)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <ImportMaintenanceLogDialog open={importing} onOpenChange={setImporting} />
    </div>
  );
}
