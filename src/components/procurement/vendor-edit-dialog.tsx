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
import { updateVendor, deleteVendor, createVendor } from "@/lib/procurement/vendor-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Vendor } from "@/types/procurement";

interface Props {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSupplierType?: NonNullable<Vendor["supplierType"]>;
}

const SUPPLIER_TYPE_OPTIONS: { value: NonNullable<Vendor["supplierType"]>; label: string }[] = [
  { value: "material", label: "Material Supplier" },
  { value: "equipment_rental", label: "Equipment Rental" },
  { value: "service", label: "Service Provider" },
  { value: "subcontractor", label: "Subcontractor" },
];

export function VendorEditDialog({ vendor, open, onOpenChange, defaultSupplierType }: Props) {
  const [vendorName, setVendorName] = React.useState("");
  const [vendorCategory, setVendorCategory] = React.useState("");
  const [trade, setTrade] = React.useState("");
  const [supplierType, setSupplierType] = React.useState<NonNullable<Vendor["supplierType"]>>("material");
  const [primaryContact, setPrimaryContact] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [zip, setZip] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    if (vendor) {
      setVendorName(vendor.vendorName);
      setVendorCategory(vendor.vendorCategory);
      setTrade(vendor.trade ?? "");
      setSupplierType(vendor.supplierType ?? "material");
      setPrimaryContact(vendor.primaryContact ?? "");
      setPhone(vendor.phone ?? "");
      setEmail(vendor.email ?? "");
      setWebsite(vendor.website ?? "");
      setAddress(vendor.address ?? "");
      setCity(vendor.city ?? "");
      setState(vendor.state ?? "");
      setZip(vendor.zip ?? "");
      setNotes(vendor.notes ?? "");
    } else {
      setVendorName("");
      setVendorCategory("");
      setTrade("");
      setSupplierType(defaultSupplierType ?? "material");
      setPrimaryContact("");
      setPhone("");
      setEmail("");
      setWebsite("");
      setAddress("");
      setCity("");
      setState("");
      setZip("");
      setNotes("");
    }
  }, [vendor, open]);

  async function handleSave() {
    const input = {
      vendorName,
      vendorCategory,
      trade: trade || undefined,
      supplierType,
      primaryContact,
      phone,
      email,
      website,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zip || undefined,
      notes,
    };
    setSaving(true);
    const result = vendor ? await updateVendor(vendor.id, input) : await createVendor(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this vendor — check your connection and try again.");
      return;
    }
    showSuccessToast(vendor ? "Vendor updated" : "Vendor added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!vendor) return;
    deleteVendor(vendor.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "New Vendor"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input id="vendorName" className="mt-1.5" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="vendorCategory">Category</Label>
              <Input id="vendorCategory" className="mt-1.5" value={vendorCategory} onChange={(e) => setVendorCategory(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade">Trade</Label>
              <Input id="trade" className="mt-1.5" value={trade} onChange={(e) => setTrade(e.target.value)} />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={supplierType}
                onValueChange={(v) => setSupplierType(v as NonNullable<Vendor["supplierType"]>)}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Setting this to Subcontractor moves the record to the Subcontractor tab.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryContact">Contact Person</Label>
              <Input id="primaryContact" className="mt-1.5" value={primaryContact} onChange={(e) => setPrimaryContact(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input id="phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" className="mt-1.5" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" className="mt-1.5" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" className="mt-1.5" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" className="mt-1.5" value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="justify-between">
          {vendor ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this vendor?</span>
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
            <Button onClick={handleSave} disabled={!vendorName.trim() || !vendorCategory.trim() || saving}>
              {saving ? "Saving…" : vendor ? "Save Changes" : "Create Vendor"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
