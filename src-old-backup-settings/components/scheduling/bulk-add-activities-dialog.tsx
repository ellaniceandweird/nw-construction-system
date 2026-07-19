"use client";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { addActivity } from "@/lib/scheduling/activity-store";
import type { ActivityInput } from "@/lib/scheduling/activity-store";
import type { ActivityStatus } from "@/types/scheduling";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In Progress" },
  { value: "delayed", label: "Delayed" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function emptyRow(): ActivityInput {
  return { projectId: "", name: "", plannedStart: "", plannedFinish: "", requiredManpower: undefined, status: "not_started", isCritical: false };
}

export function BulkAddActivitiesDialog({ open, onOpenChange }: Props) {
  const [rows, setRows] = React.useState<ActivityInput[]>([emptyRow()]);
  const [saved, setSaved] = React.useState(0);

  function reset() {
    setRows([emptyRow()]);
    setSaved(0);
  }

  function updateRow(index: number, patch: Partial<ActivityInput>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }
  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleSaveAll() {
    let count = 0;
    for (const row of rows) {
      if (!row.projectId || !row.name || !row.plannedStart || !row.plannedFinish) continue;
      const project = MOCK_PROJECTS.find((p) => p.id === row.projectId);
      addActivity(row, project?.projectName ?? "");
      count += 1;
    }
    setSaved(count);
    setRows([emptyRow()]);
  }

  const validRowCount = rows.filter((r) => r.projectId && r.name && r.plannedStart && r.plannedFinish).length;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activities (Table)</DialogTitle>
          <DialogDescription>Type directly into each row, like a spreadsheet — add as many activities as you need, then save them all at once.</DialogDescription>
        </DialogHeader>

        {saved > 0 && (
          <p className="rounded-md bg-success-soft p-3 text-sm text-success">Added {saved} activit{saved === 1 ? "y" : "ies"}. Add more below, or close this dialog.</p>
        )}

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="min-w-[180px] px-2 py-2 font-medium">Project</th>
                <th className="min-w-[200px] px-2 py-2 font-medium">Activity Name</th>
                <th className="min-w-[130px] px-2 py-2 font-medium">Planned Start</th>
                <th className="min-w-[130px] px-2 py-2 font-medium">Planned Finish</th>
                <th className="min-w-[90px] px-2 py-2 font-medium">Manpower</th>
                <th className="min-w-[140px] px-2 py-2 font-medium">Status</th>
                <th className="min-w-[70px] px-2 py-2 font-medium">Critical</th>
                <th className="px-2 py-2 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="p-1">
                    <Select value={row.projectId} onValueChange={(v) => updateRow(index, { projectId: v })}>
                      <SelectTrigger className="h-8 w-full border-0 shadow-none"><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>
                        {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1">
                    <Input className="h-8 border-0 shadow-none focus-visible:ring-1" value={row.name} onChange={(e) => updateRow(index, { name: e.target.value })} />
                  </td>
                  <td className="p-1">
                    <Input type="date" className="h-8 border-0 shadow-none focus-visible:ring-1" value={row.plannedStart} onChange={(e) => updateRow(index, { plannedStart: e.target.value })} />
                  </td>
                  <td className="p-1">
                    <Input type="date" className="h-8 border-0 shadow-none focus-visible:ring-1" value={row.plannedFinish} onChange={(e) => updateRow(index, { plannedFinish: e.target.value })} />
                  </td>
                  <td className="p-1">
                    <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={row.requiredManpower ?? ""} onChange={(e) => updateRow(index, { requiredManpower: e.target.value ? parseFloat(e.target.value) : undefined })} />
                  </td>
                  <td className="p-1">
                    <Select value={row.status} onValueChange={(v) => updateRow(index, { status: v as ActivityStatus })}>
                      <SelectTrigger className="h-8 w-full border-0 shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1 text-center">
                    <Checkbox checked={row.isCritical} onCheckedChange={(checked) => updateRow(index, { isCritical: checked === true })} />
                  </td>
                  <td className="p-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => removeRow(index)} disabled={rows.length === 1}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
          <Plus className="size-3.5" /> Add Row
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleSaveAll} disabled={validRowCount === 0}>
            Save {validRowCount > 0 ? validRowCount : ""} {validRowCount === 1 ? "Activity" : "Activities"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
