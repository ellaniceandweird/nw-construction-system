"use client";

import * as React from "react";
import { Plus, Trash2, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useActivities } from "@/hooks/use-activities";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { useProperties } from "@/hooks/use-properties";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import {
  getMostRecentLog,
  updateTimeEntry,
  addTimeEntry,
  removeTimeEntry,
  GENERAL_WORK_ACTIVITY_ID,
  MANUAL_ACTIVITY_ID,
  MANUAL_ENTRY,
} from "@/lib/field-operations/daily-log-store";
import { getPropertyForProject } from "@/lib/properties/property-relations";
import type { DailyTimeEntry } from "@/types/field-operations";

interface Props {
  /** The date of the log currently being created/viewed — the previous log is whatever came before this. */
  currentDate: string;
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

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function PreviousDayLogEditor({ currentDate }: Props) {
  const allLogs = useDailyLogs();
  const allActivities = useActivities();
  const workerRates = useFieldWorkerRates();
  const properties = useProperties();

  const previousLog = React.useMemo(
    () => (currentDate ? getMostRecentLog(currentDate) : undefined),
    [currentDate, allLogs]
  );

  if (!currentDate || !previousLog) return null;

  const project = MOCK_PROJECTS.find((p) => p.id === previousLog.projectId);

  function handleEmployeeChange(index: number, employeeId: string) {
    if (employeeId === MANUAL_ENTRY) {
      updateTimeEntry(previousLog!.id, index, { employeeId: MANUAL_ENTRY, employeeName: "", trade: "" });
      return;
    }
    const rate = workerRates.find((r) => r.employeeId === employeeId);
    updateTimeEntry(previousLog!.id, index, {
      employeeId,
      employeeName: rate?.employeeName ?? "",
      trade: rate?.trade ?? "",
    });
  }

  function handlePropertyChange(index: number, propertyId: string) {
    if (propertyId === MANUAL_ENTRY) {
      updateTimeEntry(previousLog!.id, index, { propertyId: MANUAL_ENTRY, propertyName: "" });
      return;
    }
    const property = properties.find((p) => p.id === propertyId);
    updateTimeEntry(previousLog!.id, index, { propertyId, propertyName: property?.name ?? "" });
  }

  function handleProjectChange(index: number, projectId: string) {
    if (projectId === MANUAL_ENTRY) {
      updateTimeEntry(previousLog!.id, index, {
        projectId: MANUAL_ENTRY,
        projectName: "",
        activityId: "",
        activityDescription: "",
      });
      return;
    }
    const proj = MOCK_PROJECTS.find((p) => p.id === projectId);
    const property = proj ? getPropertyForProject(proj, properties) : undefined;
    updateTimeEntry(previousLog!.id, index, {
      projectId,
      projectName: "",
      activityId: "",
      activityDescription: "",
      ...(property ? { propertyId: property.id, propertyName: property.name } : {}),
    });
  }

  function handleActivityChange(index: number, projectId: string, activityId: string) {
    if (activityId === GENERAL_WORK_ACTIVITY_ID) {
      updateTimeEntry(previousLog!.id, index, { activityId, activityDescription: "General Work" });
    } else if (activityId === MANUAL_ACTIVITY_ID) {
      updateTimeEntry(previousLog!.id, index, { activityId, activityDescription: "" });
    } else {
      const activity = allActivities.find((a) => a.id === activityId && a.projectId === projectId);
      updateTimeEntry(previousLog!.id, index, { activityId, activityDescription: activity?.name ?? "" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" /> Previous Day&apos;s Log — {formatDate(previousLog.date)}
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {project?.projectName ?? "—"} · Edits here save immediately since this log is already
          saved — fix a missed hour or add something you forgot without leaving this page.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
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
            {previousLog.timeEntries.map((entry, index) => {
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
                        onBlur={(e) => updateTimeEntry(previousLog.id, index, { employeeName: e.target.value })}
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
                        onBlur={(e) => updateTimeEntry(previousLog.id, index, { propertyName: e.target.value })}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <Select value={entry.projectId} onValueChange={(v) => handleProjectChange(index, v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>
                        {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                        <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                      </SelectContent>
                    </Select>
                    {entry.projectId === MANUAL_ENTRY && (
                      <Input
                        className="mt-1"
                        placeholder="Type project name"
                        defaultValue={entry.projectName}
                        onBlur={(e) => updateTimeEntry(previousLog.id, index, { projectName: e.target.value })}
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
                        onBlur={(e) => updateTimeEntry(previousLog.id, index, { activityDescription: e.target.value })}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={entry.regularHours}
                      onBlur={(e) => updateTimeEntry(previousLog.id, index, { regularHours: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={entry.overtimeHours}
                      onBlur={(e) => updateTimeEntry(previousLog.id, index, { overtimeHours: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      placeholder="Optional"
                      defaultValue={entry.notes}
                      onBlur={(e) => updateTimeEntry(previousLog.id, index, { notes: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeEntry(previousLog.id, index)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => addTimeEntry(previousLog.id, emptyEntry(previousLog.projectId))}
        >
          <Plus className="size-3.5" /> Add Row
        </Button>
      </CardContent>
    </Card>
  );
}
