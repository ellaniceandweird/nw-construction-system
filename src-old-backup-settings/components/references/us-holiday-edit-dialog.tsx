"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUSHoliday, updateUSHoliday, deleteUSHoliday } from "@/lib/references/us-holiday-store";
import type { USHoliday } from "@/types/references";

interface Props { holiday: USHoliday | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function USHolidayEditDialog({ holiday, open, onOpenChange }: Props) {
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(holiday?.name ?? "");
      setDate(holiday?.date ?? "");
      setNotes(holiday?.notes ?? "");
      setConfirmingDelete(false);
    }
  }, [holiday, open]);

  function handleSave() {
    if (!name || !date) return;
    const input = { name, date, notes: notes || undefined };
    if (holiday) { updateUSHoliday(holiday.id, input); } else { createUSHoliday(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!holiday) return; deleteUSHoliday(holiday.id); onOpenChange(false); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{holiday ? `Edit ${holiday.name}` : "New Holiday"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div><Label htmlFor="name">Holiday Name</Label><Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label htmlFor="date">Date</Label><Input id="date" type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label htmlFor="notes">Notes (optional)</Label><Input id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {holiday ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this holiday?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || !date}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
