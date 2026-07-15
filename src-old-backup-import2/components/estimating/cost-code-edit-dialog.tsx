"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCostCode, updateCostCode } from "@/lib/estimating/cost-code-store";
import type { CostCode } from "@/types/estimating";

interface Props { costCode: CostCode | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function CostCodeEditDialog({ costCode, open, onOpenChange }: Props) {
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [trade, setTrade] = React.useState("");
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCode(costCode?.code ?? "");
      setDescription(costCode?.description ?? "");
      setDivision(costCode?.division ?? "");
      setTrade(costCode?.trade ?? "");
      setCategory(costCode?.category ?? "");
    }
  }, [costCode, open]);

  function handleSave() {
    if (!code || !description || !division) return;
    const input = { code, description, division, trade: trade || undefined, category: category || undefined };
    if (costCode) { updateCostCode(costCode.id, input); } else { createCostCode(input); }
    onOpenChange(false);
  }
  const canSave = !!code && !!description && !!division;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{costCode ? `Edit Cost Code ${costCode.code}` : "New Cost Code"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="code">Code</Label><Input id="code" className="mt-1.5" placeholder="e.g. 074600" value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <div><Label htmlFor="trade">Trade (optional)</Label><Input id="trade" className="mt-1.5" value={trade} onChange={(e) => setTrade(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="division">Division</Label><Input id="division" className="mt-1.5" placeholder="e.g. Division 07 — Thermal & Moisture Protection" value={division} onChange={(e) => setDivision(e.target.value)} /></div>
            <div><Label htmlFor="category">Category (optional)</Label><Input id="category" className="mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} /></div>
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
