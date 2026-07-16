"use client";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice, updateInvoice, deleteInvoice } from "@/lib/financial/invoice-store";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import type { Invoice, InvoiceStatus, InvoiceLineItem } from "@/types/financial";

interface Props { invoice: Invoice | null; open: boolean; onOpenChange: (open: boolean) => void; }
const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "issued", label: "Issued" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];
function emptyLineItem(): InvoiceLineItem { return { description: "", quantity: 1, unit: "each", unitPrice: 0, amount: 0, total: 0 }; }

export function InvoiceEditDialog({ invoice, open, onOpenChange }: Props) {
  const billingEntities = useBillingEntities();
  const [projectId, setProjectId] = React.useState("");
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [billingEntityId, setBillingEntityId] = React.useState("");
  const [vendorName, setVendorName] = React.useState("");
  const [invoiceDate, setInvoiceDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [paymentTerms, setPaymentTerms] = React.useState("");
  const [invoiceStatus, setInvoiceStatus] = React.useState<InvoiceStatus>("draft");
  const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>([emptyLineItem()]);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setProjectId(invoice?.projectId ?? "");
      setInvoiceNumber(invoice?.invoiceNumber ?? "");
      setBillingEntityId(invoice?.billingEntityId ?? "");
      setVendorName(invoice?.client ?? "");
      setInvoiceDate(invoice?.invoiceDate ?? new Date().toISOString().slice(0, 10));
      setDueDate(invoice?.dueDate ?? "");
      setPaymentTerms(invoice?.paymentTerms ?? "");
      setInvoiceStatus(invoice?.invoiceStatus ?? "draft");
      setLineItems(invoice?.lineItems.length ? invoice.lineItems : [emptyLineItem()]);
      setConfirmingDelete(false);
    }
  }, [invoice, open]);

  function updateLineItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((prev) => prev.map((li, i) => {
      if (i !== index) return li;
      const next = { ...li, ...patch };
      next.amount = next.quantity * next.unitPrice;
      next.total = next.amount + (next.tax ?? 0);
      return next;
    }));
  }
  function addLineItem() { setLineItems((prev) => [...prev, emptyLineItem()]); }
  function removeLineItem(index: number) { setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)); }

  const totalAmount = lineItems.reduce((sum, li) => sum + li.total, 0);

  function handleSave() {
    if (!projectId || !invoiceNumber || !billingEntityId || !vendorName || !dueDate) return;
    const input = {
      projectId, invoiceNumber, billingEntityId, client: vendorName, invoiceDate, dueDate,
      paymentTerms: paymentTerms || undefined, preparedBy: "Ella Esquivel", invoiceStatus,
      lineItems, totalAmount,
    };
    if (invoice) { updateInvoice(invoice.id, input); } else { createInvoice(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!invoice) return; deleteInvoice(invoice.id); onOpenChange(false); }
  const canSave = !!projectId && !!invoiceNumber && !!billingEntityId && !!vendorName && !!dueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{invoice ? `Edit Invoice ${invoice.invoiceNumber}` : "New Invoice"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Select value={vendorName} onValueChange={setVendorName}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{MOCK_VENDORS.map((v) => (<SelectItem key={v.id} value={v.vendorName}>{v.vendorName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="invoiceNumber">Invoice Number</Label><Input id="invoiceNumber" className="mt-1.5" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
            <div>
              <Label>Paying Entity</Label>
              <Select value={billingEntityId} onValueChange={setBillingEntityId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select entity" /></SelectTrigger>
                <SelectContent>{billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="invoiceDate">Invoice Date</Label><Input id="invoiceDate" type="date" className="mt-1.5" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></div>
            <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" className="mt-1.5" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={invoiceStatus} onValueChange={(v) => setInvoiceStatus(v as InvoiceStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="paymentTerms">Payment Terms (optional)</Label><Input id="paymentTerms" className="mt-1.5" placeholder="e.g. Net 30" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} /></div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="size-3.5" /> Add Line Item</Button>
            </div>
            <div className="flex flex-col gap-2">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-1 items-end gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_70px_90px_auto]">
                  <div><Label className="text-xs">Description</Label><Input className="mt-1" value={li.description} onChange={(e) => updateLineItem(i, { description: e.target.value })} /></div>
                  <div><Label className="text-xs">Qty</Label><Input type="number" className="mt-1" value={li.quantity} onChange={(e) => updateLineItem(i, { quantity: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label className="text-xs">Unit Price</Label><Input type="number" className="mt-1" value={li.unitPrice} onChange={(e) => updateLineItem(i, { unitPrice: parseFloat(e.target.value) || 0 })} /></div>
                  <Button variant="ghost" size="icon" onClick={() => removeLineItem(i)}><Trash2 className="size-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
            <span className="text-sm font-medium text-foreground">Total Amount</span>
            <span className="text-base font-semibold text-foreground">{totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {invoice ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this invoice?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
