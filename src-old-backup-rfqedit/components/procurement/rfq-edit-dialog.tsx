"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateRFQ } from "@/lib/procurement/rfq-store";
import type { RequestForQuotation } from "@/types/procurement";

interface Props {
  rfq: RequestForQuotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RfqEditDialog({ rfq, open, onOpenChange }: Props) {
  const [scope, setScope] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (rfq) {
      setScope(rfq.scope ?? "");
      setDueDate(rfq.dueDate);
      setNotes(rfq.notes ?? "");
    }
  }, [rfq]);

  function handleSave() {
    if (!rfq) return;
    updateRFQ(rfq.id, { scope, dueDate, notes });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit RFQ {rfq?.rfqNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="scope">Scope</Label>
            <Textarea id="scope" className="mt-1.5" value={scope} onChange={(e) => setScope(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              className="mt-1.5"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
