"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Pencil } from "lucide-react";

import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { addMaintenanceTask, updateTaskStatus } from "@/lib/maintenance/maintenance-task-store";
import { useProperties } from "@/hooks/use-properties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintButton } from "@/components/shared/print-button";
import { MaintenanceTaskEditDialog } from "@/components/maintenance/maintenance-task-edit-dialog";
import type { MaintenancePriority, MaintenanceTask, MaintenanceTaskStatus } from "@/types/maintenance";

const PRIORITY_CLASS: Record<string, string> = {
  high: "bg-destructive-soft text-destructive",
  medium: "bg-warning-soft text-warning-foreground",
  low: "bg-info-soft text-info-foreground",
  on_hold: "bg-muted text-muted-foreground",
  long_term_project: "bg-primary-soft text-primary",
};

const STATUS_OPTIONS: { value: MaintenanceTaskStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "working_on", label: "Working On" },
  { value: "stuck", label: "Stuck" },
  { value: "complete", label: "Complete" },
];

const STATUS_CLASS: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  working_on: "bg-primary-soft text-primary",
  stuck: "bg-destructive-soft text-destructive",
  complete: "bg-success-soft text-success",
};

type SortOption = "default" | "target_completion" | "status" | "priority";

const STATUS_ORDER: Record<string, number> = { stuck: 0, working_on: 1, not_started: 2, complete: 3 };
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2, on_hold: 3, long_term_project: 4 };

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MaintenanceTasksTable() {
  const tasks = useMaintenanceTasks();
  const properties = useProperties();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = React.useRef<HTMLTableRowElement>(null);
  const [search, setSearch] = React.useState("");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [adding, setAdding] = React.useState(false);
  const [newProperty, setNewProperty] = React.useState("");

  React.useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);
  const [newDesc, setNewDesc] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<MaintenancePriority>("medium");
  const [editingTask, setEditingTask] = React.useState<MaintenanceTask | null>(null);

  let filtered = tasks.filter((t) => {
    const matchesSearch = t.taskDescription.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === "all" || t.propertyName === propertyFilter;
    return matchesSearch && matchesProperty;
  });

  if (sortBy === "target_completion") {
    filtered = [...filtered].sort((a, b) => {
      if (!a.plannedCompletionDate) return 1;
      if (!b.plannedCompletionDate) return -1;
      return new Date(a.plannedCompletionDate).getTime() - new Date(b.plannedCompletionDate).getTime();
    });
  } else if (sortBy === "status") {
    filtered = [...filtered].sort(
      (a, b) => (STATUS_ORDER[a.taskStatus] ?? 99) - (STATUS_ORDER[b.taskStatus] ?? 99)
    );
  } else if (sortBy === "priority") {
    filtered = [...filtered].sort(
      (a, b) => (PRIORITY_ORDER[a.priority ?? ""] ?? 99) - (PRIORITY_ORDER[b.priority ?? ""] ?? 99)
    );
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.dateEntered).getTime() - new Date(a.dateEntered).getTime()
    );
  }

  const propertyNames = Array.from(new Set(tasks.map((t) => t.propertyName).filter(Boolean)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {propertyNames.map((name) => (
              <SelectItem key={name} value={name!}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="target_completion">Target Completion (Earliest)</SelectItem>
            <SelectItem value="status">Status (Stuck First)</SelectItem>
            <SelectItem value="priority">Priority (High First)</SelectItem>
          </SelectContent>
        </Select>
        <PrintButton />
        <Button onClick={() => setAdding(true)} className="ml-auto print:hidden">
          <Plus /> Add Row
        </Button>
        <span className="text-sm text-muted-foreground print:hidden">
          {filtered.length} of {tasks.length} tasks
        </span>
      </div>

      {adding && (
        <Card className="print:hidden">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_2fr_140px_auto]">
            <Select value={newProperty} onValueChange={setNewProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              autoFocus
              placeholder="Task description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newDesc.trim() && newProperty) {
                  addMaintenanceTask({ propertyName: newProperty, taskDescription: newDesc, priority: newPriority });
                  setNewDesc("");
                  setAdding(false);
                }
              }}
            />
            <Select value={newPriority} onValueChange={(v) => setNewPriority(v as MaintenancePriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (!newDesc.trim() || !newProperty) return;
                addMaintenanceTask({ propertyName: newProperty, taskDescription: newDesc, priority: newPriority });
                setNewDesc("");
                setAdding(false);
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Responsible</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Target Completion</th>
              <th className="px-4 py-3 font-medium print:hidden">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr
                key={task.id}
                ref={task.id === highlightId ? highlightRef : undefined}
                className={`border-b border-border/60 last:border-0 hover:bg-accent/40 ${task.id === highlightId ? "bg-warning-soft" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">{task.propertyName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm">{task.taskDescription}</td>
                <td className="px-4 py-3">
                  {task.priority && (
                    <Badge className={`${PRIORITY_CLASS[task.priority]} border-transparent`}>
                      {task.priority.replace(/_/g, " ")}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 print:hidden">
                  <Select
                    value={task.taskStatus}
                    onValueChange={(v) => updateTaskStatus(task.id, v as MaintenanceTaskStatus)}
                  >
                    <SelectTrigger className="h-7 w-36 border-none bg-transparent p-0 shadow-none">
                      <Badge className={`${STATUS_CLASS[task.taskStatus]} border-transparent`}>
                        {STATUS_OPTIONS.find((o) => o.value === task.taskStatus)?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="hidden px-4 py-3 print:table-cell">
                  <Badge className={`${STATUS_CLASS[task.taskStatus]} border-transparent`}>
                    {STATUS_OPTIONS.find((o) => o.value === task.taskStatus)?.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{task.responsibleParty ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">{task.comments ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(task.plannedCompletionDate)}</td>
                <td className="px-4 py-3 print:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No maintenance tasks match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <MaintenanceTaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </div>
  );
}
