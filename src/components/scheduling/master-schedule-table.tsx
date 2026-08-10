"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Search, Plus, Pencil, Upload, Table2, Printer } from "lucide-react";

import { useActivities } from "@/hooks/use-activities";
import { useProjects } from "@/hooks/use-projects";
import { updateProject } from "@/lib/projects/project-store";
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
import { BulkAddActivitiesDialog } from "@/components/scheduling/bulk-add-activities-dialog";
import { computePlanVsActual } from "@/lib/scheduling/plan-vs-actual";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { buildMasterScheduleHtml } from "@/lib/scheduling/print-master-schedule";
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
  const projects = useProjects();
  const activities = useActivities();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = React.useRef<HTMLTableRowElement>(null);
  const [search, setSearch] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [bulkAddOpen, setBulkAddOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<Activity | undefined>();
  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(new Set());

  // Keeps each Project's Start Date / Target Completion Date (in Project
  // Management) matching the earliest start and latest finish among its
  // real activities here — so editing dates in either place stays in
  // sync, without a fake "Overall Project Schedule" placeholder row.
  // Only runs once real activity data has loaded; only touches projects
  // that actually have at least one activity.
  const lastPushedRef = React.useRef<Map<string, string>>(new Map());
  React.useEffect(() => {
    if (activities.length === 0) return;
    for (const project of projects) {
      const projectActivities = activities.filter((a) => a.projectId === project.id);
      if (projectActivities.length === 0) continue;
      const starts = projectActivities.map((a) => a.plannedStart).filter(Boolean);
      const finishes = projectActivities.map((a) => a.plannedFinish).filter(Boolean);
      if (starts.length === 0 || finishes.length === 0) continue;
      const earliestStart = starts.reduce((min, d) => (d < min ? d : min));
      const latestFinish = finishes.reduce((max, d) => (d > max ? d : max));
      const key = `${earliestStart}|${latestFinish}`;
      if (lastPushedRef.current.get(project.id) === key) continue;
      if (project.startDate === earliestStart && project.plannedCompletionDate === latestFinish) {
        lastPushedRef.current.set(project.id, key);
        continue;
      }
      lastPushedRef.current.set(project.id, key);
      void updateProject(project.id, { startDate: earliestStart, plannedCompletionDate: latestFinish });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, activities]);

  React.useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  React.useEffect(() => {
    if (!highlightId) return;
    const owningActivity = activities.find((a) => a.id === highlightId);
    if (owningActivity) {
      setExpandedProjects((prev) => new Set(prev).add(owningActivity.projectId));
    }
  }, [highlightId, activities]);

  function toggleProject(projectId: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  const projectsWithActivities = projects.filter((p) =>
    activities.some((a) => a.projectId === p.id)
  );

  const filtered = activities
    .filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === "all" || a.projectId === projectFilter;
      return matchesSearch && matchesProject;
    })
    .sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

  const groupedByProject = React.useMemo(() => {
    const groups = new Map<string, Activity[]>();
    for (const a of filtered) {
      if (!groups.has(a.projectId)) groups.set(a.projectId, []);
      groups.get(a.projectId)!.push(a);
    }
    return [...groups.entries()]
      .map(([projectId, projectActivities]) => {
        const project = projects.find((p) => p.id === projectId);
        const activityStart = projectActivities.reduce((min, a) => (a.plannedStart < min ? a.plannedStart : min), projectActivities[0].plannedStart);
        const activityFinish = projectActivities.reduce((max, a) => (a.plannedFinish > max ? a.plannedFinish : max), projectActivities[0].plannedFinish);
        // The project's own Start Date / Target Completion Date (set in
        // Project Management) is the source of truth for what's shown
        // here — falls back to the activity-derived range only if the
        // project doesn't have its own dates set yet.
        const start = project?.startDate || activityStart;
        const finish = project?.plannedCompletionDate || activityFinish;
        return { projectId, projectName: project?.projectName ?? "—", activities: projectActivities, start, finish };
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [filtered, projects]);

  function handlePrint() {
    try {
      openPrintWindow("Master Schedule", buildMasterScheduleHtml(projects, activities));
    } catch (err) {
      console.error("Master Schedule print failed:", err);
      alert(`Print failed to generate: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handleAdd() {
    setEditingActivity(undefined);
    setDialogOpen(true);
  }

  function handleEdit(activity: Activity) {
    setEditingActivity(activity);
    setDialogOpen(true);
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
        <Button variant="outline" onClick={() => setBulkAddOpen(true)} className="print:hidden">
          <Table2 /> Add Activities (Table)
        </Button>
        <Button onClick={handleAdd} className="print:hidden">
          <Plus /> Add Activity
        </Button>
        <Button variant="outline" onClick={handlePrint} className="print:hidden">
          <Printer /> Print
        </Button>
        <span className="text-sm text-muted-foreground">
          {filtered.length} of {activities.length} activities
        </span>
      </div>

      <Card className="overflow-x-auto py-0 print:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">Finish</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Manpower</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Plan vs Actual</th>
              <th className="px-4 py-3 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedByProject.map((group) => {
              const isExpanded = expandedProjects.has(group.projectId);
              return (
                <React.Fragment key={group.projectId}>
                  <tr
                    className="cursor-pointer border-b border-border bg-muted/30 hover:bg-muted/50"
                    onClick={() => toggleProject(group.projectId)}
                  >
                    <td colSpan={9} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-foreground">{group.projectName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(group.start)} – {formatDate(group.finish)}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {group.activities.length} activit{group.activities.length === 1 ? "y" : "ies"}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && group.activities.map((a) => (
                    <tr
                      key={a.id}
                      ref={a.id === highlightId ? highlightRef : undefined}
                      className={`border-b border-border/60 last:border-0 hover:bg-accent/40 ${a.id === highlightId ? "bg-warning-soft" : ""}`}
                    >
                      <td className="px-4 py-3 pl-10 text-muted-foreground">
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
                      <td className="px-4 py-3">
                        {(() => {
                          const pva = computePlanVsActual(a, new Date());
                          const toneClass =
                            pva.tone === "success" ? "text-success" : pva.tone === "warning" ? "text-warning-foreground" : pva.tone === "destructive" ? "text-destructive" : "text-muted-foreground";
                          return <span className={`text-xs font-medium ${toneClass}`}>{pva.label}</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
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

      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingActivity={editingActivity}
      />
      <ImportScheduleDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <BulkAddActivitiesDialog open={bulkAddOpen} onOpenChange={setBulkAddOpen} />
    </div>
  );
}
