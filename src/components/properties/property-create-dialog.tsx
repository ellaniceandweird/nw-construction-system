"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { createProperty } from "@/lib/properties/property-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyCreateDialog({ open, onOpenChange }: Props) {
  const billingEntities = useBillingEntities();
  const [address, setAddress] = React.useState("");
  const [name, setName] = React.useState("");
  const [town, setTown] = React.useState("");
  const [billingEntityId, setBillingEntityId] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAddress("");
      setName("");
      setTown("");
      setBillingEntityId("");
    }
  }, [open]);

  async function handleSave() {
    if (!address) return;
    setSaving(true);
    const result = await createProperty({
      address,
      name: name || undefined,
      town: town || undefined,
      billingEntityId: billingEntityId || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this property — check your connection and try again.");
      return;
    }
    showSuccessToast("Property added");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Property</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 391 Main Street" />
          </div>
          <div>
            <Label htmlFor="name">Property Name (optional)</Label>
            <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cidery, The Wick" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="town">Town (optional)</Label>
              <Input id="town" className="mt-1.5" value={town} onChange={(e) => setTown(e.target.value)} />
            </div>
            <div>
              <Label>Billing Entity (optional)</Label>
              <Select value={billingEntityId} onValueChange={setBillingEntityId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select billing entity" /></SelectTrigger>
                <SelectContent>{billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!address || saving}>{saving ? "Saving…" : "Create Property"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
