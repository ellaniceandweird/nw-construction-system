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
import { updateVendor } from "@/lib/procurement/vendor-store";
import type { Vendor } from "@/types/procurement";

interface Props {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorEditDialog({ vendor, open, onOpenChange }: Props) {
  const [vendorName, setVendorName] = React.useState("");
  const [vendorCategory, setVendorCategory] = React.useState("");
  const [primaryContact, setPrimaryContact] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (vendor) {
      setVendorName(vendor.vendorName);
      setVendorCategory(vendor.vendorCategory);
      setPrimaryContact(vendor.primaryContact ?? "");
      setPhone(vendor.phone ?? "");
      setEmail(vendor.email ?? "");
      setWebsite(vendor.website ?? "");
      setNotes(vendor.notes ?? "");
    }
  }, [vendor]);

  function handleSave() {
    if (!vendor) return;
    updateVendor(vendor.id, { vendorName, vendorCategory, primaryContact, phone, email, website, notes });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
