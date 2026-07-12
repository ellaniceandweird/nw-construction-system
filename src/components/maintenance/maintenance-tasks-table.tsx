"use client";

import * as React from "react";
import { Search, Plus } from "lucide-react";

import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { addMaintenanceTask, updateTaskStatus } from "@/lib/maintenance/maintenance-task-store";
import { MOCK_PROPERTIES } from "@/lib/data/mock/properties";
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
import type { MaintenancePriority, MaintenanceTaskStatus } from "@/types/maintenance";

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

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MaintenanceTasksTable() {
  const tasks = useMaintenanceTasks();
  const [search, setSearch] = React.useState("");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [adding, setAdding] = React.useState(false);
  const [newProperty, setNewProperty] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<MaintenancePriority>("medium");

  const filtered = tasks
    .filter((t) => {
      const matchesSearch = t.taskDescription.toLowerCase().includes(search.toLowerCase());
      const matchesProperty = propertyFilter === "all" || t.propertyName === propertyFilter;
      return matchesSearch && matchesProperty;
    })
    .sort((a, b) => new Date(b.dateEntered).getTime() - new Date(a.dateEntered).getTime());

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
        <Button onClick={() => setAdding(true)} className="ml-auto">
          <Plus /> Add Row
        </Button>
        <span className="text-sm text-muted-foreground">
          {filtered.length} of {tasks.length} tasks
        </span>
      </div>

      {adding && (
        <Card>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_2fr_140px_auto]">
            <Select value={newProperty} onValueChange={setNewProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PROPERTIES.map((p) => (
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
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Responsible</th>
              <th className="px-4 py-3 font-medium">Planned Completion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr key={task.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground max-w-sm">{task.taskDescription}</td>
                <td className="px-4 py-3 text-muted-foreground">{task.propertyName ?? "—"}</td>
                <td className="px-4 py-3">
                  {task.priority && (
                    <Badge className={`${PRIORITY_CLASS[task.priority]} border-transparent`}>
                      {task.priority.replace(/_/g, " ")}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 text-muted-foreground">{task.responsibleParty ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(task.plannedCompletionDate)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No maintenance tasks match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
