"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBillingEntity, updateBillingEntity, deleteBillingEntity } from "@/lib/financial/billing-entity-store";
import type { BillingEntity } from "@/types/financial";

interface Props { entity: BillingEntity | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function BillingEntityEditDialog({ entity, open, onOpenChange }: Props) {
  const [companyName, setCompanyName] = React.useState("");
  const [legalName, setLegalName] = React.useState("");
  const [taxId, setTaxId] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [invoicePrefix, setInvoicePrefix] = React.useState("");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCompanyName(entity?.companyName ?? "");
      setLegalName(entity?.legalName ?? "");
      setTaxId(entity?.taxId ?? "");
      setAddress(entity?.address ?? "");
      setInvoicePrefix(entity?.invoicePrefix ?? "");
      setDefaultPaymentTerms(entity?.defaultPaymentTerms ?? "");
      setConfirmingDelete(false);
    }
  }, [entity, open]);

  function handleSave() {
    if (!companyName) return;
    const input = { companyName, legalName: legalName || undefined, taxId: taxId || undefined, address: address || undefined, invoicePrefix: invoicePrefix || undefined, defaultPaymentTerms: defaultPaymentTerms || undefined };
    if (entity) { updateBillingEntity(entity.id, input); } else { createBillingEntity(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!entity) return; deleteBillingEntity(entity.id); onOpenChange(false); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{entity ? "Edit Entity" : "New Entity"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div><Label htmlFor="companyName">Company Name</Label><Input id="companyName" className="mt-1.5" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="legalName">Legal Name (optional)</Label><Input id="legalName" className="mt-1.5" value={legalName} onChange={(e) => setLegalName(e.target.value)} /></div>
            <div><Label htmlFor="taxId">Tax ID (optional)</Label><Input id="taxId" className="mt-1.5" value={taxId} onChange={(e) => setTaxId(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="address">Address (optional)</Label><Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="invoicePrefix">Invoice Prefix (optional)</Label><Input id="invoicePrefix" className="mt-1.5" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} /></div>
            <div><Label htmlFor="defaultPaymentTerms">Default Payment Terms (optional)</Label><Input id="defaultPaymentTerms" className="mt-1.5" placeholder="e.g. Net 30" value={defaultPaymentTerms} onChange={(e) => setDefaultPaymentTerms(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {entity ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this entity?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!companyName}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
