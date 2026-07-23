"use client";
import * as React from "react";
import { ClipboardList, Wrench, FolderKanban, Search, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRecentActivityFeed } from "@/lib/dashboard/metrics";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

const ICONS = { log: ClipboardList, maintenance: Wrench, project: FolderKanban };
const ICON_TONE = {
  log: "text-primary",
  maintenance: "text-warning-foreground",
  project: "text-success",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityLogTable() {
  const dailyLogs = useDailyLogs();
  const maintenanceTasks = useMaintenanceTasks();
  const projects = useProjects();
  const allItems = getRecentActivityFeed(dailyLogs, maintenanceTasks, projects, 200);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest">("newest");

  const filtered = allItems.filter((item) => {
    if (typeFilter !== "all" && item.icon !== typeFilter) return false;
    if (search) {
      const haystack = `${item.description} ${item.subDescription ?? ""}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });
  const items = [...filtered].sort((a, b) =>
    sortBy === "newest" ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime()
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search activity…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="log">Daily Log</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="project">Project</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{items.length} of {allItems.length}</span>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Property / Project</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Icon className={cn("size-4", ICON_TONE[item.icon])} />
                  </td>
                  <td className="px-4 py-3 text-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.subDescription ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.date)}</td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  {allItems.length === 0 ? "Nothing logged yet." : "No activity matches your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
