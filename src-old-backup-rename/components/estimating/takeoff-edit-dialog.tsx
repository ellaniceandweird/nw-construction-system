"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTakeoffItem, updateTakeoffItem, deleteTakeoffItem } from "@/lib/estimating/takeoff-store";
import { useCostCodes } from "@/hooks/use-cost-codes";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MATERIAL_RULES } from "@/lib/forecast/material-detector";
import type { TakeoffItem, MeasurementUnit } from "@/types/estimating";

interface Props { item: TakeoffItem | null; open: boolean; onOpenChange: (open: boolean) => void; }
const UNIT_OPTIONS: MeasurementUnit[] = ["sf", "sq", "lf", "cy", "pieces", "each", "hours", "tons", "gallons", "pounds", "meters", "custom"];
const NONE = "none";

export function TakeoffEditDialog({ item, open, onOpenChange }: Props) {
  const costCodes = useCostCodes();
  const [projectId, setProjectId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [costCode, setCostCode] = React.useState(NONE);
  const [unit, setUnit] = React.useState<MeasurementUnit>("each");
  const [quantity, setQuantity] = React.useState("");
  const [wasteFactorPercent, setWasteFactorPercent] = React.useState("");
  const [materialKey, setMaterialKey] = React.useState(NONE);
  const [measuredBy, setMeasuredBy] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setProjectId(item?.projectId ?? "");
      setDescription(item?.description ?? "");
      setLocation(item?.location ?? "");
      setCostCode(item?.costCode ?? NONE);
      setUnit(item?.measurementType ?? "each");
      setQuantity(item ? String(item.quantity) : "");
      setWasteFactorPercent(item?.wasteFactorPercent != null ? String(item.wasteFactorPercent) : "");
      setMaterialKey(item?.materialKey ?? NONE);
      setMeasuredBy(item?.measuredBy ?? "");
      setConfirmingDelete(false);
    }
  }, [item, open]);

  function handleSave() {
    if (!projectId || !description || !quantity) return;
    const input = {
      projectId, description, location: location || undefined,
      costCode: costCode === NONE ? undefined : costCode,
      csiDivision: costCode === NONE ? undefined : costCodes.find((c) => c.code === costCode)?.division,
      measurementType: unit, unit, quantity: parseFloat(quantity),
      wasteFactorPercent: wasteFactorPercent ? parseFloat(wasteFactorPercent) : undefined,
      materialKey: materialKey === NONE ? undefined : materialKey,
      measuredBy: measuredBy || undefined,
    };
    if (item) { updateTakeoffItem(item.id, input); } else { createTakeoffItem(input); }
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Edit Takeoff Item" : "New Takeoff Item"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="description">Description</Label><Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="location">Location (optional)</Label><Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <div>
              <Label>Cost Code (optional)</Label>
              <Select value={costCode} onValueChange={setCostCode}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>None</SelectItem>{costCodes.map((c) => (<SelectItem key={c.id} value={c.code}>{c.code} — {c.description}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div>
              <Label>Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as MeasurementUnit)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{UNIT_OPTIONS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="wasteFactorPercent">Waste % (optional)</Label><Input id="wasteFactorPercent" type="number" className="mt-1.5" value={wasteFactorPercent} onChange={(e) => setWasteFactorPercent(e.target.value)} /></div>
          </div>
          <div>
            <Label>Forecast Material Match (optional)</Label>
            <Select value={materialKey} onValueChange={setMaterialKey}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent><SelectItem value={NONE}>None</SelectItem>{MATERIAL_RULES.map((r) => (<SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>))}</SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">If set, Procurement&apos;s Forecast tab will use this quantity instead of its own illustrative default.</p>
          </div>
          <div><Label htmlFor="measuredBy">Measured By (optional)</Label><Input id="measuredBy" className="mt-1.5" value={measuredBy} onChange={(e) => setMeasuredBy(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {item ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this item?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-3.5" /> Delete Item
              </Button>
            )
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
