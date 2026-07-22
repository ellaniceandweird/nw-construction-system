"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { Cloud, Users, ClipboardList, Package, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useActivities } from "@/hooks/use-activities";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import {
  updateTimeEntry,
  addTimeEntry,
  removeTimeEntry,
  GENERAL_WORK_ACTIVITY_ID,
} from "@/lib/field-operations/daily-log-store";
import type { DailyTimeEntry } from "@/types/field-operations";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function emptyEntry(defaultProjectId: string): DailyTimeEntry {
  return {
    employeeId: "",
    employeeName: "",
    trade: "",
    status: "present",
    projectId: defaultProjectId,
    activityId: "",
    activityDescription: "",
    regularHours: 8,
    overtimeHours: 0,
    notes: "",
  };
}

export default function DailyLogDetailPage() {
  const params = useParams<{ logId: string }>();
  const logs = useDailyLogs();
  const allActivities = useActivities();
  const workerRates = useFieldWorkerRates();
  const log = logs.find((l) => l.id === params.logId);

  const [addingEntry, setAddingEntry] = React.useState(false);
  const [draft, setDraft] = React.useState<DailyTimeEntry | null>(null);

  if (!log) notFound();

  const project = MOCK_PROJECTS.find((p) => p.id === log.projectId);
  const totalHours = log.timeEntries.reduce((s, e) => s + e.regularHours + e.overtimeHours, 0);
  const totalOvertime = log.timeEntries.reduce((s, e) => s + e.overtimeHours, 0);
  const crewCount = new Set(log.timeEntries.map((e) => e.employeeId)).size;

  function startAdding() {
    setDraft(emptyEntry(log!.projectId));
    setAddingEntry(true);
  }

  function saveDraft() {
    if (!draft || !draft.employeeId || !draft.projectId || !draft.activityId) return;
    addTimeEntry(log!.id, draft);
    setAddingEntry(false);
    setDraft(null);
  }

  return (
    <>
      <PageHeader
        title={`Daily Log — ${formatDate(log.date)}`}
        description={project?.projectName ?? "—"}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Weather</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Cloud className="size-4" />
              {log.weatherCondition.replace("_", " ")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Crew Present</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-4" />
              {crewCount}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Hours</span>
            <span className="font-medium text-foreground">
              {totalHours}h {totalOvertime > 0 && `(+${totalOvertime}h OT)`}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4" /> Time Entries
          </CardTitle>
          <Button variant="outline" size="sm" onClick={startAdding}>
            <Plus /> Add Row
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {log.timeEntries.map((entry, i) => {
            const entryProject = MOCK_PROJECTS.find((p) => p.id === entry.projectId);
            return (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.trade ? `${entry.trade} · ` : ""}
                    {entryProject?.projectName ?? entry.projectName ?? "—"}
                    {entry.propertyName ? ` · ${entry.propertyName}` : ""} · {entry.activityDescription || "General Work"}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={entry.regularHours}
                    className="h-8 w-16 text-sm"
                    onBlur={(e) => updateTimeEntry(log!.id, i, { regularHours: Number(e.target.value) || 0 })}
                  />
                  <span className="text-xs text-muted-foreground">reg</span>
                  <Input
                    type="number"
                    defaultValue={entry.overtimeHours}
                    className="h-8 w-16 text-sm"
                    onBlur={(e) => updateTimeEntry(log!.id, i, { overtimeHours: Number(e.target.value) || 0 })}
                  />
                  <span className="text-xs text-muted-foreground">ot</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => removeTimeEntry(log!.id, i)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
          {log.timeEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No time entries yet.</p>
          )}

          {addingEntry && draft && (
            <div className="rounded-lg bg-accent/40 p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">Employee</label>
                  <Select
                    value={draft.employeeId}
                    onValueChange={(v) => {
                      const rate = workerRates.find((r) => r.employeeId === v);
                      setDraft({ ...draft, employeeId: v, employeeName: rate?.employeeName ?? "", trade: rate?.trade ?? "" });
                    }}
                  >
                    <SelectTrigger className="mt-1 h-8 w-full"><SelectValue placeholder="Select an employee" /></SelectTrigger>
                    <SelectContent>
                      {workerRates.map((r) => (
                        <SelectItem key={r.employeeId} value={r.employeeId}>{r.employeeName} — {r.trade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Project</label>
                  <Select
                    value={draft.projectId}
                    onValueChange={(v) => setDraft({ ...draft, projectId: v, activityId: "", activityDescription: "" })}
                  >
                    <SelectTrigger className="mt-1 h-8 w-full"><SelectValue placeholder="Select a project" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_80px_1fr]">
                <div>
                  <label className="text-xs text-muted-foreground">Activity</label>
                  <Select
                    value={draft.activityId}
                    onValueChange={(v) => {
                      const desc = v === GENERAL_WORK_ACTIVITY_ID
                        ? "General Work"
                        : allActivities.find((a) => a.id === v && a.projectId === draft.projectId)?.name ?? "";
                      setDraft({ ...draft, activityId: v, activityDescription: desc });
                    }}
                  >
                    <SelectTrigger className="mt-1 h-8 w-full"><SelectValue placeholder="Select an activity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GENERAL_WORK_ACTIVITY_ID}>General Work</SelectItem>
                      {allActivities.filter((a) => a.projectId === draft.projectId).map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reg Hrs</label>
                  <Input type="number" className="mt-1 h-8" value={draft.regularHours} onChange={(e) => setDraft({ ...draft, regularHours: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">OT Hrs</label>
                  <Input type="number" className="mt-1 h-8" value={draft.overtimeHours} onChange={(e) => setDraft({ ...draft, overtimeHours: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Input className="mt-1 h-8" value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={saveDraft}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingEntry(false); setDraft(null); }}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(log.materialDeliveries.length > 0 || log.materialConsumption.length > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {log.materialDeliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-4" /> Material Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {log.materialDeliveries.map((d, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {d.itemsDelivered} — {d.quantity} ({d.status})
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
          {log.materialConsumption.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-4" /> Material Used
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {log.materialConsumption.map((m, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {m.material}: {m.quantityUsed} {m.unit} used
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {log.generalNotes && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{log.generalNotes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
