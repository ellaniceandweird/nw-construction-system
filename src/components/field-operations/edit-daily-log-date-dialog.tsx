"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDailyLogDate } from "@/lib/field-operations/daily-log-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";

interface Props {
  logId: string;
  currentDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDailyLogDateDialog({ logId, currentDate, open, onOpenChange }: Props) {
  const [date, setDate] = React.useState(currentDate);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setDate(currentDate);
  }, [open, currentDate]);

  async function handleSave() {
    if (!date) return;
    setSaving(true);
    const result = await updateDailyLogDate(logId, date);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this date — check your connection and try again.");
      return;
    }
    showSuccessToast("Date updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Daily Log Date</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="logDate">Date</Label>
          <Input id="logDate" type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!date || saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
