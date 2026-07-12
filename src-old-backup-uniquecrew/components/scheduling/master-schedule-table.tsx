"use client";

import * as React from "react";
import { Search, Plus, Pencil, Trash2, Upload } from "lucide-react";

import { useActivities } from "@/hooks/use-activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { deleteActivity } from "@/lib/scheduling/activity-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActivityFormDialog } from "@/components/scheduling/activity-form-dialog";
import { ImportScheduleDialog } from "@/components/scheduling/import-schedule-dialog";
import { SchedulePrintTable } from "@/components/scheduling/print/schedule-print-table";
import type { Activity } from "@/types/scheduling";

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-success-soft text-success",
  in_progress: "bg-primary-soft text-primary",
  delayed: "bg-destructive-soft text-destructive",
  blocked: "bg-destructive-soft text-destructive",
  not_started: "bg-muted text-muted-foreground",
  ready: "bg-info-soft text-info-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MasterScheduleTable() {
  const activities = useActivities();
  const [search, setSearch] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<Activity | undefined>();

  const projectsWithActivities = MOCK_PROJECTS.filter((p) =>
    activities.some((a) => a.projectId === p.id)
  );

  const filtered = activities
    .filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === "all" || a.projectId === projectFilter;
      return matchesSearch && matchesProject;
    })
    .sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

  function handleAdd() {
    setEditingActivity(undefined);
    setDialogOpen(true);
  }

  function handleEdit(activity: Activity) {
    setEditingActivity(activity);
    setDialogOpen(true);
  }

  function handleDelete(activity: Activity) {
    if (window.confirm(`Remove "${activity.name}" from the Master Schedule?`)) {
      deleteActivity(activity.id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectsWithActivities.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="ml-auto print:hidden">
          <Upload /> Import Schedule
        </Button>
        <Button onClick={handleAdd} className="print:hidden">
          <Plus /> Add Activity
        </Button>
        <span className="text-sm text-muted-foreground">
          {filtered.length} of {activities.length} activities
        </span>
      </div>

      <Card className="overflow-x-auto py-0 print:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">Finish</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Manpower</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const project = MOCK_PROJECTS.find((p) => p.id === a.projectId);
              return (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {project?.projectName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.name}
                    {a.isCritical && (
                      <Badge variant="destructive" className="ml-2">
                        Critical
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.plannedStart)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.plannedFinish)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.originalDurationDays}d</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.requiredManpower ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={a.percentComplete} className="w-16" />
                      <span className="text-xs text-muted-foreground">{a.percentComplete}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[a.status] ?? ""} border-transparent`}>
                      {a.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No activities match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <SchedulePrintTable
        title="Master Schedule — All Activities"
        extraLabel="Duration"
        rows={activities.map((a) => {
          const project = MOCK_PROJECTS.find((p) => p.id === a.projectId);
          return {
            key: a.id,
            project: project?.projectName ?? "—",
            activity: a.name,
            start: formatDate(a.plannedStart),
            finish: formatDate(a.plannedFinish),
            extra: `${a.originalDurationDays}d`,
            status: a.status.replace("_", " "),
          };
        })}
      />

      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingActivity={editingActivity}
      />
      <ImportScheduleDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}
