"use client";

import * as React from "react";
import { Users, ClipboardList, Truck, Wrench, CloudRain, Plus, X, Target } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { useDailyWorkPlanDetails } from "@/hooks/use-daily-work-plan-details";
import { getDetailsForDate, upsertDailyWorkPlanDetails } from "@/lib/scheduling/daily-work-plan-details-store";
import { showErrorToast } from "@/lib/toast/toast-store";
import type { CrewAttendanceEntry, TaskAssignmentEntry, ProcurementNeedEntry } from "@/types/daily-work-plan-details";
import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

interface Props {
  date: Date;
  activities: { activity: Activity }[];
  projects: Project[];
}

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DailyWorkPlanDetailsPanel({ date, activities, projects }: Props) {
  const workerRates = useFieldWorkerRates();
  useDailyWorkPlanDetails();

  const dateStr = toDateStr(date);

  const [crewAttendance, setCrewAttendance] = React.useState<CrewAttendanceEntry[]>([]);
  const [taskAssignments, setTaskAssignments] = React.useState<TaskAssignmentEntry[]>([]);
  const [procurementNeeds, setProcurementNeeds] = React.useState<ProcurementNeedEntry[]>([]);
  const [equipmentNeeded, setEquipmentNeeded] = React.useState("");
  const [rainPlan, setRainPlan] = React.useState("");

  React.useEffect(() => {
    const existing = getDetailsForDate(dateStr);
    setCrewAttendance(
      existing?.crewAttendance.length
        ? existing.crewAttendance
        : workerRates.map((r) => ({ employeeId: r.employeeId, employeeName: r.employeeName, present: true }))
    );
    setTaskAssignments(existing?.taskAssignments ?? []);
    setProcurementNeeds(existing?.procurementNeeds ?? []);
    setEquipmentNeeded(existing?.equipmentNeeded ?? "");
    setRainPlan(existing?.rainPlan ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, workerRates.length]);

  async function save(patch: Partial<{
    crewAttendance: CrewAttendanceEntry[];
    taskAssignments: TaskAssignmentEntry[];
    procurementNeeds: ProcurementNeedEntry[];
    equipmentNeeded: string;
    rainPlan: string;
  }>) {
    const result = await upsertDailyWorkPlanDetails({
      date: dateStr,
      crewAttendance,
      taskAssignments,
      procurementNeeds,
      equipmentNeeded,
      rainPlan,
      ...patch,
    });
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save — check your connection and try again.");
    }
  }

  function toggleAttendance(employeeId: string) {
    const next = crewAttendance.map((c) => (c.employeeId === employeeId ? { ...c, present: !c.present } : c));
    setCrewAttendance(next);
    void save({ crewAttendance: next });
  }

  const presentCrew = crewAttendance.filter((c) => c.present);

  function getAssignment(activityId: string): TaskAssignmentEntry {
    return taskAssignments.find((t) => t.activityId === activityId) ?? { activityId, assignedEmployeeIds: [], dailyCompletionTarget: "" };
  }

  function updateAssignment(activityId: string, patch: Partial<TaskAssignmentEntry>) {
    const existing = getAssignment(activityId);
    const updated = { ...existing, ...patch };
    const next = [...taskAssignments.filter((t) => t.activityId !== activityId), updated];
    setTaskAssignments(next);
    void save({ taskAssignments: next });
  }

  function toggleAssignedWorker(activityId: string, employeeId: string) {
    const current = getAssignment(activityId);
    const assignedEmployeeIds = current.assignedEmployeeIds.includes(employeeId)
      ? current.assignedEmployeeIds.filter((id) => id !== employeeId)
      : [...current.assignedEmployeeIds, employeeId];
    updateAssignment(activityId, { assignedEmployeeIds });
  }

  function addProcurementRow() {
    const next = [...procurementNeeds, { id: `PN-${Date.now()}`, item: "", ordered: false }];
    setProcurementNeeds(next);
    void save({ procurementNeeds: next });
  }

  function updateProcurementRow(id: string, patch: Partial<ProcurementNeedEntry>) {
    const next = procurementNeeds.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setProcurementNeeds(next);
    void save({ procurementNeeds: next });
  }

  function removeProcurementRow(id: string) {
    const next = procurementNeeds.filter((p) => p.id !== id);
    setProcurementNeeds(next);
    void save({ procurementNeeds: next });
  }

  const activeProjectsWithDates = projects.filter((p) => p.calculatedStatus === "active" && p.plannedCompletionDate);

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="size-4" /> Crew Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {crewAttendance.map((c) => (
              <label
                key={c.employeeId}
                className={`flex items-center gap-2 rounded-md border p-2 text-sm ${c.present ? "border-border" : "border-border opacity-50"}`}
              >
                <Checkbox checked={c.present} onCheckedChange={() => toggleAttendance(c.employeeId)} />
                {c.employeeName}
              </label>
            ))}
            {crewAttendance.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">No crew members set up in Field Worker Rates yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="size-4" /> Task Assignments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activities.map(({ activity }) => {
            const project = projects.find((p) => p.id === activity.projectId);
            const assignment = getAssignment(activity.id);
            return (
              <div key={activity.id} className="rounded-md border border-border p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">{project?.projectName} — {activity.name}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {presentCrew.length === 0 && <span className="text-xs text-muted-foreground">No crew marked present today</span>}
                  {presentCrew.map((c) => (
                    <button
                      key={c.employeeId}
                      type="button"
                      onClick={() => toggleAssignedWorker(activity.id, c.employeeId)}
                      className="focus:outline-none"
                    >
                      <Badge
                        className={
                          assignment.assignedEmployeeIds.includes(c.employeeId)
                            ? "bg-primary-soft text-primary border-transparent cursor-pointer"
                            : "bg-muted text-muted-foreground border-transparent cursor-pointer"
                        }
                      >
                        {c.employeeName}
                      </Badge>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Target className="size-3.5 shrink-0 text-muted-foreground" />
                  <Input
                    className="h-8 text-sm"
                    placeholder="What's expected to be finished today specifically…"
                    defaultValue={assignment.dailyCompletionTarget ?? ""}
                    onBlur={(e) => updateAssignment(activity.id, { dailyCompletionTarget: e.target.value })}
                  />
                </div>
              </div>
            );
          })}
          {activities.length === 0 && <p className="text-sm text-muted-foreground">No jobs selected for this day yet.</p>}
        </CardContent>
      </Card>

      {activeProjectsWithDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Completion Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeProjectsWithDates.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-2.5 text-sm">
                  <p className="font-medium text-foreground">{p.projectName}</p>
                  <p className="text-muted-foreground">Target: {formatDate(p.plannedCompletionDate)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="size-4" /> Procurement Needed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {procurementNeeds.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Input
                  className="h-8 flex-1 text-sm"
                  placeholder="Item"
                  defaultValue={p.item}
                  onBlur={(e) => updateProcurementRow(p.id, { item: e.target.value })}
                />
                <Input
                  className="h-8 w-20 text-sm"
                  placeholder="Qty"
                  defaultValue={p.quantity ?? ""}
                  onBlur={(e) => updateProcurementRow(p.id, { quantity: e.target.value })}
                />
                <Input
                  type="date"
                  className="h-8 w-36 text-sm"
                  defaultValue={p.neededByDate ?? ""}
                  onBlur={(e) => updateProcurementRow(p.id, { neededByDate: e.target.value })}
                />
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Checkbox checked={p.ordered} onCheckedChange={(checked) => updateProcurementRow(p.id, { ordered: checked === true })} />
                  Ordered
                </label>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => removeProcurementRow(p.id)}>
                  <X className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit" onClick={addProcurementRow}>
              <Plus className="size-3.5" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="size-4" /> Equipment Needed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g. 28ft ladder, roofing nail gun, generator…"
              defaultValue={equipmentNeeded}
              onBlur={(e) => { setEquipmentNeeded(e.target.value); void save({ equipmentNeeded: e.target.value }); }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudRain className="size-4" /> Rain Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What happens if it rains today?"
            defaultValue={rainPlan}
            onBlur={(e) => { setRainPlan(e.target.value); void save({ rainPlan: e.target.value }); }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
