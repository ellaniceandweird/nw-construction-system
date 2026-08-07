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
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyDisplayName } from "@/lib/properties/property-relations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialRequestCreateDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const properties = useProperties();
  const [projectId, setProjectId] = React.useState("");
  const [propertyId, setPropertyId] = React.useState("");
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
      setPropertyId("");
      setDescription("");
      setQuantity("1");
      setUnit("ea");
      setRequiredOnSiteDate(new Date().toISOString().slice(0, 10));
      setRequestedBy("");
      setReferenceUrl("");
      setNotes("");
    }
  }, [open]);

  const canSave = !!description && !!requestedBy;
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const result = await createMaterialRequest({
      projectId: projectId || undefined,
      propertyId: propertyId || undefined,
      propertyName: propertyId ? getPropertyDisplayName(properties.find((p) => p.id === propertyId)!) : undefined,
      description,
      quantity: Number(quantity) || 1,
      unit,
      requiredOnSiteDate,
      requestedBy,
      referenceUrl: referenceUrl || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this request — check your connection and try again.");
      return;
    }
    showSuccessToast("Material request added");
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
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select a property" /></SelectTrigger>
              <SelectContent>
                {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{getPropertyDisplayName(p)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
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
          <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
