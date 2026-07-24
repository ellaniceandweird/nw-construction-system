"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useActivities } from "@/hooks/use-activities";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { useProperties } from "@/hooks/use-properties";
import {
  updateTimeEntry,
  addTimeEntry,
  removeTimeEntry,
  GENERAL_WORK_ACTIVITY_ID,
  MANUAL_ACTIVITY_ID,
  MANUAL_ENTRY,
} from "@/lib/field-operations/daily-log-store";
import { getPropertyForProject } from "@/lib/properties/property-relations";
import type { DailyLog, DailyTimeEntry } from "@/types/field-operations";

interface Props {
  log: DailyLog;
}

function emptyEntry(defaultProjectId: string): DailyTimeEntry {
  return {
    employeeId: "",
    employeeName: "",
    trade: "",
    status: "present",
    propertyId: "",
    propertyName: "",
    projectId: defaultProjectId,
    projectName: "",
    activityId: "",
    activityDescription: "",
    regularHours: 8,
    overtimeHours: 0,
    notes: "",
  };
}

/**
 * Full-featured editable time-entries table for an already-saved Daily
 * Log — worker/property/project/activity dropdowns all with manual
 * entry, used by both the log detail page and the previous-day editor
 * so the two never drift out of sync feature-wise.
 */
export function EditableTimeEntriesTable({ log }: Props) {
  const projects = useProjects();
  const allActivities = useActivities();
  const workerRates = useFieldWorkerRates();
  const properties = useProperties();

  function handleEmployeeChange(index: number, employeeId: string) {
    if (employeeId === MANUAL_ENTRY) {
      updateTimeEntry(log.id, index, { employeeId: MANUAL_ENTRY, employeeName: "", trade: "" });
      return;
    }
    const rate = workerRates.find((r) => r.employeeId === employeeId);
    updateTimeEntry(log.id, index, {
      employeeId,
      employeeName: rate?.employeeName ?? "",
      trade: rate?.trade ?? "",
    });
  }

  function handlePropertyChange(index: number, propertyId: string) {
    if (propertyId === MANUAL_ENTRY) {
      updateTimeEntry(log.id, index, { propertyId: MANUAL_ENTRY, propertyName: "" });
      return;
    }
    const property = properties.find((p) => p.id === propertyId);
    updateTimeEntry(log.id, index, { propertyId, propertyName: property?.name ?? "" });
  }

  function handleProjectChange(index: number, projectId: string) {
    if (projectId === MANUAL_ENTRY) {
      updateTimeEntry(log.id, index, {
        projectId: MANUAL_ENTRY,
        projectName: "",
        activityId: "",
        activityDescription: "",
      });
      return;
    }
    const proj = projects.find((p) => p.id === projectId);
    const property = proj ? getPropertyForProject(proj, properties) : undefined;
    updateTimeEntry(log.id, index, {
      projectId,
      projectName: "",
      activityId: "",
      activityDescription: "",
      ...(property ? { propertyId: property.id, propertyName: property.name } : {}),
    });
  }

  function handleActivityChange(index: number, projectId: string, activityId: string) {
    if (activityId === GENERAL_WORK_ACTIVITY_ID) {
      updateTimeEntry(log.id, index, { activityId, activityDescription: "General Work" });
    } else if (activityId === MANUAL_ACTIVITY_ID) {
      updateTimeEntry(log.id, index, { activityId, activityDescription: "" });
    } else {
      const activity = allActivities.find((a) => a.id === activityId && a.projectId === projectId);
      updateTimeEntry(log.id, index, { activityId, activityDescription: activity?.name ?? "" });
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-2 py-2 font-medium">Worker&apos;s Name</th>
            <th className="px-2 py-2 font-medium">Property</th>
            <th className="px-2 py-2 font-medium">Project</th>
            <th className="px-2 py-2 font-medium">Activity</th>
            <th className="px-2 py-2 font-medium w-20">Reg Hrs</th>
            <th className="px-2 py-2 font-medium w-20">OT Hrs</th>
            <th className="px-2 py-2 font-medium">Notes</th>
            <th className="px-2 py-2 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {log.timeEntries.map((entry, index) => {
            const rowActivities = allActivities.filter((a) => a.projectId === entry.projectId);
            return (
              <tr key={index} className="border-b border-border/60 last:border-0 align-top">
                <td className="px-2 py-2">
                  <Select value={entry.employeeId} onValueChange={(v) => handleEmployeeChange(index, v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select worker" /></SelectTrigger>
                    <SelectContent>
                      {workerRates.map((r) => (
                        <SelectItem key={r.employeeId} value={r.employeeId}>{r.employeeName} — {r.trade}</SelectItem>
                      ))}
                      <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                    </SelectContent>
                  </Select>
                  {entry.employeeId === MANUAL_ENTRY && (
                    <Input
                      className="mt-1"
                      placeholder="Type worker's name"
                      defaultValue={entry.employeeName}
                      onBlur={(e) => updateTimeEntry(log.id, index, { employeeName: e.target.value })}
                    />
                  )}
                </td>
                <td className="px-2 py-2">
                  <Select value={entry.propertyId ?? ""} onValueChange={(v) => handlePropertyChange(index, v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                      <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                    </SelectContent>
                  </Select>
                  {entry.propertyId === MANUAL_ENTRY && (
                    <Input
                      className="mt-1"
                      placeholder="Type property name"
                      defaultValue={entry.propertyName}
                      onBlur={(e) => updateTimeEntry(log.id, index, { propertyName: e.target.value })}
                    />
                  )}
                </td>
                <td className="px-2 py-2">
                  <Select value={entry.projectId} onValueChange={(v) => handleProjectChange(index, v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                      <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                    </SelectContent>
                  </Select>
                  {entry.projectId === MANUAL_ENTRY && (
                    <Input
                      className="mt-1"
                      placeholder="Type project name"
                      defaultValue={entry.projectName}
                      onBlur={(e) => updateTimeEntry(log.id, index, { projectName: e.target.value })}
                    />
                  )}
                </td>
                <td className="px-2 py-2">
                  <Select
                    value={entry.activityId ?? ""}
                    onValueChange={(v) => handleActivityChange(index, entry.projectId, v)}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select activity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GENERAL_WORK_ACTIVITY_ID}>General Work</SelectItem>
                      {rowActivities.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                      <SelectItem value={MANUAL_ACTIVITY_ID}>Manual entry…</SelectItem>
                    </SelectContent>
                  </Select>
                  {entry.activityId === MANUAL_ACTIVITY_ID && (
                    <Input
                      className="mt-1"
                      placeholder="Type activity"
                      defaultValue={entry.activityDescription}
                      onBlur={(e) => updateTimeEntry(log.id, index, { activityDescription: e.target.value })}
                    />
                  )}
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    className="w-20"
                    defaultValue={entry.regularHours}
                    onBlur={(e) => updateTimeEntry(log.id, index, { regularHours: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    className="w-20"
                    defaultValue={entry.overtimeHours}
                    onBlur={(e) => updateTimeEntry(log.id, index, { overtimeHours: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    placeholder="Optional"
                    defaultValue={entry.notes}
                    onBlur={(e) => updateTimeEntry(log.id, index, { notes: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTimeEntry(log.id, index)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            );
          })}
          {log.timeEntries.length === 0 && (
            <tr>
              <td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">No time entries yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => addTimeEntry(log.id, emptyEntry(log.projectId))}
      >
        <Plus className="size-3.5" /> Add Row
      </Button>
    </div>
  );
}
