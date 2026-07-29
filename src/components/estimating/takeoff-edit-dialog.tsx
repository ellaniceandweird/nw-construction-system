"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { createTakeoffItem, updateTakeoffItem, deleteTakeoffItem } from "@/lib/estimating/takeoff-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { TakeoffItem, MeasurementUnit } from "@/types/estimating";

interface Props {
  item: TakeoffItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UNIT_OPTIONS: MeasurementUnit[] = ["sf", "sq", "lf", "cy", "pieces", "each", "hours", "tons", "gallons", "pounds", "meters"];

export function TakeoffEditDialog({ item, open, onOpenChange }: Props) {
  const projects = useProjects();
  const [projectId, setProjectId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [costCode, setCostCode] = React.useState("");
  const [csiDivision, setCsiDivision] = React.useState("");
  const [measurementType, setMeasurementType] = React.useState<MeasurementUnit>("sf");
  const [quantity, setQuantity] = React.useState("");
  const [wasteFactorPercent, setWasteFactorPercent] = React.useState("");
  const [measuredBy, setMeasuredBy] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    if (item) {
      setProjectId(item.projectId);
      setDescription(item.description);
      setLocation(item.location ?? "");
      setCostCode(item.costCode ?? "");
      setCsiDivision(item.csiDivision ?? "");
      setMeasurementType(item.measurementType);
      setQuantity(String(item.quantity));
      setWasteFactorPercent(item.wasteFactorPercent != null ? String(item.wasteFactorPercent) : "");
      setMeasuredBy(item.measuredBy ?? "");
    } else {
      setProjectId("");
      setDescription("");
      setLocation("");
      setCostCode("");
      setCsiDivision("");
      setMeasurementType("sf");
      setQuantity("");
      setWasteFactorPercent("");
      setMeasuredBy("");
    }
  }, [item, open]);

  async function handleSave() {
    if (!projectId || !description || !quantity) return;
    const input = {
      projectId,
      description,
      location: location || undefined,
      costCode: costCode || undefined,
      csiDivision: csiDivision || undefined,
      measurementType,
      unit: measurementType,
      quantity: parseFloat(quantity),
      wasteFactorPercent: wasteFactorPercent ? parseFloat(wasteFactorPercent) : undefined,
      measuredBy: measuredBy || undefined,
    };
    setSaving(true);
    const result = item ? await updateTakeoffItem(item.id, input) : await createTakeoffItem(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this takeoff item — check your connection and try again.");
      return;
    }
    showSuccessToast(item ? "Takeoff item updated" : "Takeoff item added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!item) return;
    deleteTakeoffItem(item.id);
    onOpenChange(false);
  }

  const canSave = !!projectId && !!description && !!quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Takeoff Item" : "New Takeoff Item"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="csiDivision">CSI Division (optional)</Label>
              <Input id="csiDivision" className="mt-1.5" value={csiDivision} onChange={(e) => setCsiDivision(e.target.value)} placeholder="e.g. Division 07" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Unit</Label>
              <Select value={measurementType} onValueChange={(v) => setMeasurementType(v as MeasurementUnit)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{UNIT_OPTIONS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wasteFactorPercent">Waste % (optional)</Label>
              <Input id="wasteFactorPercent" type="number" className="mt-1.5" value={wasteFactorPercent} onChange={(e) => setWasteFactorPercent(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costCode">Cost Code (optional)</Label>
              <Input id="costCode" className="mt-1.5" value={costCode} onChange={(e) => setCostCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="measuredBy">Measured By (optional)</Label>
              <Input id="measuredBy" className="mt-1.5" value={measuredBy} onChange={(e) => setMeasuredBy(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter className="justify-between">
          {item ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this item?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
