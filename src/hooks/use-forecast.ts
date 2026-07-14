"use client";

import { useMemo } from "react";

import { useActivities } from "@/hooks/use-activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MOCK_TAKEOFF_QUANTITIES } from "@/lib/data/mock/material-takeoff-quantities";
import {
  detectMaterialsForActivity,
  isOpenActivity,
} from "@/lib/forecast/material-detector";

export type ForecastUrgency = "overdue" | "urgent" | "upcoming" | "planned";

export interface ForecastRow {
  key: string;
  projectId: string;
  projectName: string;
  materialKey: string;
  label: string;
  unit: string;
  quantity: number;
  quantitySource: "estimate" | "illustrative default";
  neededBy: string;
  urgency: ForecastUrgency;
  sourceActivityNames: string[];
  vendorCategory: string;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function urgencyFor(daysOut: number): ForecastUrgency {
  if (daysOut < 0) return "overdue";
  if (daysOut <= 7) return "urgent";
  if (daysOut <= 21) return "upcoming";
  return "planned";
}

const DEFAULT_QTY_PER_ACTIVITY: Record<string, number> = {
  "cedar-siding": 250,
  windows: 4,
  roofing: 10,
  masonry: 2,
  "rebar-concrete": 30,
  "paint-stain": 5,
  "decking-lumber": 100,
  "trim-fascia": 80,
  fencing: 40,
};

interface Group {
  projectId: string;
  materialKey: string;
  label: string;
  unit: string;
  vendorCategory: string;
  activityNames: string[];
  plannedStarts: string[];
  occurrences: number;
}

/**
 * Automated Material Forecast — scans the live Master Schedule for open
 * (not completed/cancelled) activities, runs the keyword-based material
 * detector on each, and consolidates the results into one row per
 * project + material with a combined quantity and the earliest date
 * it's needed by. See lib/forecast/material-detector.ts for how
 * detection works, and lib/data/mock/material-takeoff-quantities.ts for
 * where quantities come from until real Estimating takeoffs exist.
 */
export function useForecast(): ForecastRow[] {
  const activities = useActivities();

  return useMemo(() => {
    const openActivities = activities.filter(isOpenActivity);
    const groups = new Map<string, Group>();

    for (const activity of openActivities) {
      for (const d of detectMaterialsForActivity(activity)) {
        const groupKey = `${activity.projectId}::${d.materialKey}`;
        const existing = groups.get(groupKey);
        if (existing) {
          existing.activityNames.push(activity.name);
          existing.plannedStarts.push(activity.plannedStart);
          existing.occurrences += 1;
        } else {
          groups.set(groupKey, {
            projectId: activity.projectId,
            materialKey: d.materialKey,
            label: d.label,
            unit: d.unit,
            vendorCategory: d.vendorCategory,
            activityNames: [activity.name],
            plannedStarts: [activity.plannedStart],
            occurrences: 1,
          });
        }
      }
    }

    const rows: ForecastRow[] = [];
    for (const [key, g] of groups) {
      const project = MOCK_PROJECTS.find((p) => p.id === g.projectId);
      const takeoff = MOCK_TAKEOFF_QUANTITIES.find(
        (t) => t.projectId === g.projectId && t.materialKey === g.materialKey
      );
      const quantity = takeoff
        ? takeoff.quantity
        : g.occurrences * (DEFAULT_QTY_PER_ACTIVITY[g.materialKey] ?? 1);
      const neededBy = [...g.plannedStarts].sort()[0];

      rows.push({
        key,
        projectId: g.projectId,
        projectName: project?.projectName ?? g.projectId,
        materialKey: g.materialKey,
        label: g.label,
        unit: takeoff?.unit ?? g.unit,
        quantity,
        quantitySource: takeoff ? "estimate" : "illustrative default",
        neededBy,
        urgency: urgencyFor(daysUntil(neededBy)),
        sourceActivityNames: g.activityNames,
        vendorCategory: g.vendorCategory,
      });
    }

    return rows.sort((a, b) => new Date(a.neededBy).getTime() - new Date(b.neededBy).getTime());
  }, [activities]);
}
