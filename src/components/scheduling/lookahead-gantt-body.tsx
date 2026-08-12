"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

const BAR_COLOR: Record<string, string> = {
  completed: "bg-success",
  in_progress: "bg-primary",
  delayed: "bg-destructive",
  blocked: "bg-destructive",
  not_started: "bg-muted-foreground/40",
  ready: "bg-primary",
};

function formatShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface LookaheadItem {
  activityId: string;
  description: string;
  plannedStart: string;
  plannedFinish: string;
}

interface WeekMarker {
  label: string;
  leftPercent: number;
}

interface Props {
  items: LookaheadItem[];
  activities: Activity[];
  projects: Project[];
  windowStart: Date;
  windowEnd: Date;
  windowDays: number;
  weekMarkers: WeekMarker[];
}

function parseDate(d: string) {
  return new Date(d + "T00:00:00");
}

/**
 * Groups lookahead rows by project — one collapsible project row per
 * project (spanning its own earliest-to-latest activity in this window),
 * with its individual activities as hideable child rows underneath.
 * Matches the same collapse/expand pattern as Master Schedule, so the
 * whole Planning module behaves consistently, like an outline in a
 * spreadsheet rather than one long flat list.
 */
export function LookaheadGanttBody({ items, activities, projects, windowStart, windowEnd, windowDays, weekMarkers }: Props) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  function toggle(projectId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function barGeometry(startStr: string, finishStr: string) {
    const start = parseDate(startStr);
    const end = parseDate(finishStr);
    const clampedStart = start < windowStart ? windowStart : start;
    const clampedEnd = end > windowEnd ? windowEnd : end;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const leftPercent = ((clampedStart.getTime() - windowStart.getTime()) / DAY_MS / windowDays) * 100;
    const widthPercent = Math.max(2, ((clampedEnd.getTime() - clampedStart.getTime()) / DAY_MS / windowDays) * 100);
    return { start, end, leftPercent, widthPercent };
  }

  const groups = React.useMemo(() => {
    const byProject = new Map<string, LookaheadItem[]>();
    for (const item of items) {
      const activity = activities.find((a) => a.id === item.activityId);
      if (!activity) continue;
      const list = byProject.get(activity.projectId) ?? [];
      list.push(item);
      byProject.set(activity.projectId, list);
    }
    return Array.from(byProject.entries()).map(([projectId, projectItems]) => {
      const project = projects.find((p) => p.id === projectId);
      const starts = projectItems.map((i) => i.plannedStart).sort();
      const finishes = projectItems.map((i) => i.plannedFinish).sort();
      return {
        projectId,
        project,
        items: projectItems,
        earliestStart: starts[0],
        latestFinish: finishes[finishes.length - 1],
      };
    });
  }, [items, activities, projects]);

  return (
    <>
      {groups.map((group) => {
        const isExpanded = expanded.has(group.projectId);
        const { leftPercent, widthPercent } = barGeometry(group.earliestStart, group.latestFinish);
        return (
          <React.Fragment key={group.projectId}>
            <div className="flex border-b border-border/60 bg-muted/30">
              <button
                type="button"
                onClick={() => toggle(group.projectId)}
                className="flex w-64 shrink-0 items-center gap-1.5 border-r border-border px-4 py-3 text-left hover:bg-accent/40"
              >
                {isExpanded ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
                <span className="truncate text-sm font-semibold text-foreground">{group.project?.projectName ?? "—"}</span>
              </button>
              <div className="relative flex-1 py-3">
                {weekMarkers.map((w) => (
                  <div key={w.label} className="absolute top-0 h-full border-l border-border/40" style={{ left: `${w.leftPercent}%` }} />
                ))}
                <div
                  className="absolute h-5 rounded-md bg-foreground/70"
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, top: "50%", transform: "translateY(-50%)" }}
                  title={`${group.project?.projectName}: ${group.items.length} activit${group.items.length === 1 ? "y" : "ies"}`}
                />
              </div>
            </div>

            {isExpanded && group.items.map((item) => {
              const activity = activities.find((a) => a.id === item.activityId);
              const { start, end, leftPercent: itemLeft, widthPercent: itemWidth } = barGeometry(item.plannedStart, item.plannedFinish);
              const color = BAR_COLOR[activity?.status ?? "not_started"];
              return (
                <div key={item.activityId} className="flex border-b border-border/60 last:border-0">
                  <div className="w-64 shrink-0 border-r border-border py-3 pl-8 pr-4">
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="relative flex-1 py-3">
                    {weekMarkers.map((w) => (
                      <div key={w.label} className="absolute top-0 h-full border-l border-border/40" style={{ left: `${w.leftPercent}%` }} />
                    ))}
                    <div
                      className={cn("absolute h-5 rounded-md", color)}
                      style={{ left: `${itemLeft}%`, width: `${itemWidth}%`, top: "50%", transform: "translateY(-50%)" }}
                      title={`${item.description}: ${formatShort(start)} – ${formatShort(end)} (${activity?.percentComplete ?? 0}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {groups.length === 0 && (
        <div className="px-4 py-10 text-center text-muted-foreground">
          No activities fall within this window.
        </div>
      )}
    </>
  );
}
