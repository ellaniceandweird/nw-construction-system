"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { Cloud, Users, ClipboardList, Package, Plus, Trash2, CheckCircle2, Circle, Pencil } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import {
  updateCrewHours,
  addCrewMember,
  removeCrewMember,
  addActivityToLog,
  toggleActivityComplete,
  removeActivityFromLog,
} from "@/lib/field-operations/daily-log-store";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DailyLogDetailPage() {
  const params = useParams<{ logId: string }>();
  const logs = useDailyLogs();
  const log = logs.find((l) => l.id === params.logId);

  const [editingCrewIndex, setEditingCrewIndex] = React.useState<number | null>(null);
  const [newCrewName, setNewCrewName] = React.useState("");
  const [newCrewTrade, setNewCrewTrade] = React.useState("");
  const [newCrewHours, setNewCrewHours] = React.useState("8");
  const [addingCrew, setAddingCrew] = React.useState(false);

  const [newActivityDesc, setNewActivityDesc] = React.useState("");
  const [newActivityHours, setNewActivityHours] = React.useState("8");
  const [addingActivity, setAddingActivity] = React.useState(false);

  if (!log) notFound();

  const project = MOCK_PROJECTS.find((p) => p.id === log.projectId);
  const totalHours = log.crewAttendance.reduce((s, c) => s + c.hoursWorked, 0);
  const totalOvertime = log.crewAttendance.reduce((s, c) => s + c.overtimeHours, 0);

  const inProgress = log.activitiesPerformed
    .map((a, i) => ({ ...a, index: i }))
    .filter((a) => a.percentComplete < 100);
  const completed = log.activitiesPerformed
    .map((a, i) => ({ ...a, index: i }))
    .filter((a) => a.percentComplete >= 100);

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
              {new Set(log.crewAttendance.map((c) => c.crewName)).size}
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Crew Attendance — editable */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" /> Crew Attendance
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddingCrew(true)}>
              <Plus /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {log.crewAttendance.map((crew, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{crew.crewName}</p>
                  <p className="text-xs text-muted-foreground">
                    {crew.trade} · {project?.projectName ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {editingCrewIndex === i ? (
                    <Input
                      type="number"
                      autoFocus
                      defaultValue={crew.hoursWorked}
                      className="h-8 w-16 text-sm"
                      onBlur={(e) => {
                        updateCrewHours(log.id, i, Number(e.target.value) || 0);
                        setEditingCrewIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingCrewIndex(i)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {crew.hoursWorked}h
                      <Pencil className="size-3" />
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => removeCrewMember(log.id, i)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {addingCrew && (
              <div className="grid grid-cols-[1fr_1fr_70px_auto] items-end gap-2 rounded-lg bg-accent/40 p-2">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                    autoFocus
                    className="mt-1 h-8"
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCrewName.trim()) {
                        addCrewMember(log.id, newCrewName, newCrewTrade || "General", Number(newCrewHours) || 8);
                        setNewCrewName("");
                        setNewCrewTrade("");
                        setNewCrewHours("8");
                        setAddingCrew(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Trade</label>
                  <Input
                    className="mt-1 h-8"
                    value={newCrewTrade}
                    onChange={(e) => setNewCrewTrade(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hours</label>
                  <Input
                    type="number"
                    className="mt-1 h-8"
                    value={newCrewHours}
                    onChange={(e) => setNewCrewHours(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!newCrewName.trim()) return;
                    addCrewMember(log.id, newCrewName, newCrewTrade || "General", Number(newCrewHours) || 8);
                    setNewCrewName("");
                    setNewCrewTrade("");
                    setNewCrewHours("8");
                    setAddingCrew(false);
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities — split into In Progress / Completed */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4" /> Activities
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddingActivity(true)}>
              <Plus /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">IN PROGRESS TODAY</p>
              <div className="flex flex-col gap-2">
                {inProgress.map((activity) => (
                  <div key={activity.index} className="flex items-center gap-2">
                    <button onClick={() => toggleActivityComplete(log.id, activity.index)}>
                      <Circle className="size-4 text-muted-foreground/50" />
                    </button>
                    <p className="flex-1 text-sm text-foreground">{activity.description}</p>
                    <Badge variant="outline">{activity.hoursWorked}h</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => removeActivityFromLog(log.id, activity.index)}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {inProgress.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nothing in progress.</p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-success">COMPLETED YESTERDAY</p>
              <div className="flex flex-col gap-2">
                {completed.map((activity) => (
                  <div key={activity.index} className="flex items-center gap-2">
                    <button onClick={() => toggleActivityComplete(log.id, activity.index)}>
                      <CheckCircle2 className="size-4 text-success" />
                    </button>
                    <p className="flex-1 text-sm text-muted-foreground line-through">
                      {activity.description}
                    </p>
                    <Badge className="bg-success-soft text-success border-transparent">
                      {activity.hoursWorked}h
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => removeActivityFromLog(log.id, activity.index)}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {completed.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nothing marked complete yet — click the circle next to an item above to mark it done.</p>
                )}
              </div>
            </div>

            {addingActivity && (
              <div className="grid grid-cols-[1fr_70px_auto] items-end gap-2 rounded-lg bg-accent/40 p-2">
                <div>
                  <label className="text-xs text-muted-foreground">Description</label>
                  <Input
                    autoFocus
                    className="mt-1 h-8"
                    value={newActivityDesc}
                    onChange={(e) => setNewActivityDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newActivityDesc.trim()) {
                        addActivityToLog(log.id, newActivityDesc, Number(newActivityHours) || 8);
                        setNewActivityDesc("");
                        setNewActivityHours("8");
                        setAddingActivity(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hours</label>
                  <Input
                    type="number"
                    className="mt-1 h-8"
                    value={newActivityHours}
                    onChange={(e) => setNewActivityHours(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!newActivityDesc.trim()) return;
                    addActivityToLog(log.id, newActivityDesc, Number(newActivityHours) || 8);
                    setNewActivityDesc("");
                    setNewActivityHours("8");
                    setAddingActivity(false);
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
