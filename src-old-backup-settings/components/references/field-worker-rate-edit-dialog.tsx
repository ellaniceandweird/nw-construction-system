"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFieldWorkerRate, updateFieldWorkerRate, deleteFieldWorkerRate } from "@/lib/references/field-worker-rate-store";
import type { FieldWorkerRate } from "@/types/references";

interface Props { rate: FieldWorkerRate | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function FieldWorkerRateEditDialog({ rate, open, onOpenChange }: Props) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [employeeName, setEmployeeName] = React.useState("");
  const [trade, setTrade] = React.useState("");
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [overtimeRate, setOvertimeRate] = React.useState("");
  const [defaultCostCode, setDefaultCostCode] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setEmployeeId(rate?.employeeId ?? "");
      setEmployeeName(rate?.employeeName ?? "");
      setTrade(rate?.trade ?? "");
      setHourlyRate(rate ? String(rate.hourlyRate) : "");
      setOvertimeRate(rate?.overtimeRate != null ? String(rate.overtimeRate) : "");
      setDefaultCostCode(rate?.defaultCostCode ?? "");
      setNotes(rate?.notes ?? "");
      setConfirmingDelete(false);
    }
  }, [rate, open]);

  function handleSave() {
    if (!employeeName || !hourlyRate) return;
    const input = {
      employeeId: employeeId || `EMP-${Date.now()}`,
      employeeName, trade: trade || "General",
      hourlyRate: parseFloat(hourlyRate),
      overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
      defaultCostCode: defaultCostCode || undefined,
      notes: notes || undefined,
    };
    if (rate) { updateFieldWorkerRate(rate.id, input); } else { createFieldWorkerRate(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!rate) return; deleteFieldWorkerRate(rate.id); onOpenChange(false); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{rate ? `Edit Rate — ${rate.employeeName}` : "New Field Worker Rate"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="employeeName">Employee Name</Label><Input id="employeeName" className="mt-1.5" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} /></div>
            <div><Label htmlFor="employeeId">Employee ID (optional)</Label><Input id="employeeId" className="mt-1.5" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="trade">Trade</Label><Input id="trade" className="mt-1.5" value={trade} onChange={(e) => setTrade(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="hourlyRate">Hourly Rate ($)</Label><Input id="hourlyRate" type="number" className="mt-1.5" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} /></div>
            <div><Label htmlFor="overtimeRate">Overtime Rate ($, optional)</Label><Input id="overtimeRate" type="number" className="mt-1.5" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="defaultCostCode">Default Cost Code (optional)</Label><Input id="defaultCostCode" className="mt-1.5" value={defaultCostCode} onChange={(e) => setDefaultCostCode(e.target.value)} /></div>
          <div><Label htmlFor="notes">Notes (optional)</Label><Input id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {rate ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this rate?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!employeeName || !hourlyRate}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
