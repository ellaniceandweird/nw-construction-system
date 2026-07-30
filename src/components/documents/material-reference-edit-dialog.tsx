"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMaterialReference, updateMaterialReference, deleteMaterialReference } from "@/lib/documents/material-reference-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { MaterialReference } from "@/types/material-reference";

interface Props {
  item: MaterialReference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialReferenceEditDialog({ item, open, onOpenChange }: Props) {
  const [materialName, setMaterialName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [specification, setSpecification] = React.useState("");
  const [preferredVendor, setPreferredVendor] = React.useState("");
  const [referenceUrl, setReferenceUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setMaterialName(item?.materialName ?? "");
    setCategory(item?.category ?? "");
    setSpecification(item?.specification ?? "");
    setPreferredVendor(item?.preferredVendor ?? "");
    setReferenceUrl(item?.referenceUrl ?? "");
    setNotes(item?.notes ?? "");
  }, [item, open]);

  async function handleSave() {
    if (!materialName) return;
    const input = {
      materialName,
      category: category || undefined,
      specification: specification || undefined,
      preferredVendor: preferredVendor || undefined,
      referenceUrl: referenceUrl || undefined,
      notes: notes || undefined,
    };
    setSaving(true);
    const result = item ? await updateMaterialReference(item.id, input) : await createMaterialReference(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this material — check your connection and try again.");
      return;
    }
    showSuccessToast(item ? "Material updated" : "Material added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!item) return;
    deleteMaterialReference(item.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Material" : "New Material Reference"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="materialName">Material Name</Label>
            <Input id="materialName" className="mt-1.5" value={materialName} onChange={(e) => setMaterialName(e.target.value)} placeholder="e.g. Cedar Lap Siding" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" className="mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Siding" />
            </div>
            <div>
              <Label htmlFor="preferredVendor">Preferred Vendor</Label>
              <Input id="preferredVendor" className="mt-1.5" value={preferredVendor} onChange={(e) => setPreferredVendor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="specification">Specification</Label>
            <Input id="specification" className="mt-1.5" value={specification} onChange={(e) => setSpecification(e.target.value)} placeholder="e.g. Grade A, 1x6, pre-primed" />
          </div>
          <div>
            <Label htmlFor="referenceUrl">Spec Sheet / Reference Link</Label>
            <Input id="referenceUrl" className="mt-1.5" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="justify-between">
          {item ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this material?</span>
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
            <Button onClick={handleSave} disabled={!materialName || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
