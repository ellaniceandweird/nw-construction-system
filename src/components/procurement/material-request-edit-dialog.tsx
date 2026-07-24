"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMaterialRequest, deleteMaterialRequest } from "@/lib/procurement/material-request-store";
import type { MaterialRequest, MaterialRequestStatus } from "@/types/procurement";

interface Props {
  request: MaterialRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: MaterialRequestStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "rfq_issued", label: "RFQ Issued" },
  { value: "po_issued", label: "PO Issued" },
  { value: "closed", label: "Closed" },
];

export function MaterialRequestEditDialog({ request, open, onOpenChange }: Props) {
  const [requestStatus, setRequestStatus] = React.useState<MaterialRequestStatus>("draft");
  const [notes, setNotes] = React.useState("");
  const [referenceUrl, setReferenceUrl] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (request) {
      setRequestStatus(request.requestStatus);
      setNotes(request.notes ?? "");
      setReferenceUrl(request.referenceUrl ?? "");
      setConfirmingDelete(false);
    }
  }, [request]);

  function handleSave() {
    if (!request) return;
    updateMaterialRequest(request.id, { requestStatus, notes, referenceUrl });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!request) return;
    deleteMaterialRequest(request.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Material Request {request?.mrNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Status</Label>
            <Select value={requestStatus} onValueChange={(v) => setRequestStatus(v as MaterialRequestStatus)}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="referenceUrl">Reference (file, Google Doc, or PDF link)</Label>
            <Input
              id="referenceUrl"
              placeholder="https://..."
              className="mt-1.5"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {request ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this request?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
