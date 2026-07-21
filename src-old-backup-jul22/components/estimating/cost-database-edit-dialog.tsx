"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCostDatabaseItem, updateCostDatabaseItem, deleteCostDatabaseItem } from "@/lib/estimating/cost-database-store";
import type { CostDatabaseItem } from "@/types/estimating";

interface Props { item: CostDatabaseItem | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function CostDatabaseEditDialog({ item, open, onOpenChange }: Props) {
  const [costCode, setCostCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [laborCost, setLaborCost] = React.useState("");
  const [materialCost, setMaterialCost] = React.useState("");
  const [equipmentCost, setEquipmentCost] = React.useState("");
  const [subcontractCost, setSubcontractCost] = React.useState("");
  const [profitPercent, setProfitPercent] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCostCode(item?.costCode ?? "");
      setDescription(item?.description ?? "");
      setUnit(item?.unit ?? "");
      setLaborCost(item ? String(item.laborCost) : "0");
      setMaterialCost(item ? String(item.materialCost) : "0");
      setEquipmentCost(item ? String(item.equipmentCost) : "0");
      setSubcontractCost(item ? String(item.subcontractCost) : "0");
      setProfitPercent(item?.profitPercent != null ? String(item.profitPercent) : "");
      setSupplier(item?.supplier ?? "");
      setConfirmingDelete(false);
    }
  }, [item, open]);

  function handleSave() {
    if (!costCode || !description || !unit) return;
    const input = {
      costCode, description, unit,
      laborCost: parseFloat(laborCost) || 0,
      materialCost: parseFloat(materialCost) || 0,
      equipmentCost: parseFloat(equipmentCost) || 0,
      subcontractCost: parseFloat(subcontractCost) || 0,
      profitPercent: profitPercent ? parseFloat(profitPercent) : undefined,
      supplier: supplier || undefined,
    };
    if (item) { updateCostDatabaseItem(item.id, input); } else { createCostDatabaseItem(input); }
    onOpenChange(false);
  }
  function handleDelete() {
    if (!item) return;
    deleteCostDatabaseItem(item.id);
    onOpenChange(false);
  }
  const canSave = !!costCode && !!description && !!unit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? `Edit Rate — ${item.costCode}` : "New Rate"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="costCode">Cost Code</Label><Input id="costCode" className="mt-1.5" placeholder="e.g. 074600" value={costCode} onChange={(e) => setCostCode(e.target.value)} /></div>
            <div><Label htmlFor="unit">Unit</Label><Input id="unit" className="mt-1.5" placeholder="e.g. sf" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-4 gap-4">
            <div><Label className="text-xs">Labor / unit</Label><Input type="number" className="mt-1" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} /></div>
            <div><Label className="text-xs">Material / unit</Label><Input type="number" className="mt-1" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} /></div>
            <div><Label className="text-xs">Equipment / unit</Label><Input type="number" className="mt-1" value={equipmentCost} onChange={(e) => setEquipmentCost(e.target.value)} /></div>
            <div><Label className="text-xs">Subcontract / unit</Label><Input type="number" className="mt-1" value={subcontractCost} onChange={(e) => setSubcontractCost(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="profitPercent">Default Markup % (optional)</Label><Input id="profitPercent" type="number" className="mt-1.5" value={profitPercent} onChange={(e) => setProfitPercent(e.target.value)} /></div>
            <div><Label htmlFor="supplier">Typical Supplier (optional)</Label><Input id="supplier" className="mt-1.5" value={supplier} onChange={(e) => setSupplier(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {item ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this rate?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-3.5" /> Delete Rate
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
