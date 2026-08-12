"use client";

import * as React from "react";
import { CheckCircle2, Wrench, Search, ArrowUpDown } from "lucide-react";

import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MaintenanceLogView() {
  const allEntries = useMaintenanceLog();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest">("newest");

  const filtered = allEntries.filter((e) => {
    if (!search) return true;
    return `${e.description} ${e.propertyName ?? ""} ${e.detail}`.toLowerCase().includes(search.toLowerCase());
  });
  const entries = [...filtered].sort((a, b) =>
    sortBy === "newest" ? b.timestamp.localeCompare(a.timestamp) : a.timestamp.localeCompare(b.timestamp)
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This log fills in automatically — whenever a General Maintenance task is marked
        complete, or a Recurring Maintenance record&apos;s Last Completed date is updated,
        an entry appears here. Nothing is entered manually.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search log…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
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
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
