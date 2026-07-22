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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaterialRequest } from "@/lib/procurement/material-request-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialRequestCreateDialog({ open, onOpenChange }: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [unit, setUnit] = React.useState("ea");
  const [requiredOnSiteDate, setRequiredOnSiteDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [requestedBy, setRequestedBy] = React.useState("");
  const [referenceUrl, setReferenceUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setProjectId("");
      setDescription("");
      setQuantity("1");
      setUnit("ea");
      setRequiredOnSiteDate(new Date().toISOString().slice(0, 10));
      setRequestedBy("");
      setReferenceUrl("");
      setNotes("");
    }
  }, [open]);

  const canSave = !!projectId && !!description && !!requestedBy;

  function handleSave() {
    if (!canSave) return;
    createMaterialRequest({
      projectId,
      description,
      quantity: Number(quantity) || 1,
      unit,
      requiredOnSiteDate,
      requestedBy,
      referenceUrl: referenceUrl || undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Material Request</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">What's needed</Label>
            <Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Cedar board siding" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" className="mt-1.5" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ea, ft, box…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neededBy">Needed By</Label>
              <Input id="neededBy" type="date" className="mt-1.5" value={requiredOnSiteDate} onChange={(e) => setRequiredOnSiteDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input id="requestedBy" className="mt-1.5" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="referenceUrl">Reference (file, Google Doc, or PDF link — optional)</Label>
            <Input id="referenceUrl" placeholder="https://..." className="mt-1.5" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
