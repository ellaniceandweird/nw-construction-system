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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { updateProperty, deleteProperty } from "@/lib/properties/property-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Property } from "@/types/maintenance";

interface Props {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Focused edit for the References > Billing Entities table — just the
 * three things that table shows (Property, Address, Billing Entity),
 * not the full Property detail view with photos/Drive/maintenance
 * history. Use the Properties module itself for everything else.
 */
export function PropertyBillingEditDialog({ property, open, onOpenChange }: Props) {
  const billingEntities = useBillingEntities();
  const [address, setAddress] = React.useState("");
  const [billingEntityId, setBillingEntityId] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (property && open) {
      setAddress(property.address ?? "");
      setBillingEntityId(property.billingEntityId ?? "");
      setConfirmingDelete(false);
    }
  }, [property, open]);

  async function handleSave() {
    if (!property) return;
    setSaving(true);
    const result = await updateProperty(property.id, {
      address: address || undefined,
      billingEntityId: billingEntityId || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this property — check your connection and try again.");
      return;
    }
    showSuccessToast("Property updated");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!property) return;
    deleteProperty(property.id);
    onOpenChange(false);
  }

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Property Billing</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <div className="mt-1.5 flex h-9 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground">
              {property.name}
            </div>
          </div>
          <div>
            <Label htmlFor="propAddress">Address</Label>
            <Input id="propAddress" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 104 Water Street" />
          </div>
          <div>
            <Label>Billing Entity</Label>
            <Select value={billingEntityId} onValueChange={setBillingEntityId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select billing entity" /></SelectTrigger>
              <SelectContent>
                {billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="justify-between">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this property?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
