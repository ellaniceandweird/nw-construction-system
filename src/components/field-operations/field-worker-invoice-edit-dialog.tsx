"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { getBillingEntityIdForProject } from "@/lib/properties/property-relations";
import { updateFieldWorkerInvoice, deleteFieldWorkerInvoice } from "@/lib/field-operations/field-worker-invoice-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { FieldWorkerInvoice, FieldWorkerInvoiceLineItem } from "@/types/field-worker-invoices";

interface Props {
  invoice: FieldWorkerInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function computeAmount(li: FieldWorkerInvoiceLineItem): number {
  return li.regularHours * li.regularRate + li.overtimeHours * li.overtimeRate;
}

export function FieldWorkerInvoiceEditDialog({ invoice, open, onOpenChange }: Props) {
  const projects = useProjects();
  const properties = useProperties();
  const billingEntities = useBillingEntities();
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [paymentDueDate, setPaymentDueDate] = React.useState("");
  const [lineItems, setLineItems] = React.useState<FieldWorkerInvoiceLineItem[]>([]);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open || !invoice) return;
    setInvoiceNumber(invoice.invoiceNumber);
    setPaymentDueDate(invoice.paymentDueDate ?? "");
    setLineItems(
      invoice.lineItems.map((li) => {
        if (li.billingEntityId) return { ...li };
        const project = projects.find((p) => p.id === li.projectId);
        const resolved = project ? getBillingEntityIdForProject(project, properties) : undefined;
        return { ...li, billingEntityId: resolved };
      })
    );
    setConfirmingDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, open]);

  function updateLineItem(index: number, patch: Partial<FieldWorkerInvoiceLineItem>) {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  const computedLineItems = lineItems.map((li) => ({ ...li, amount: computeAmount(li) }));
  const totalHours = computedLineItems.reduce((s, li) => s + li.regularHours + li.overtimeHours, 0);
  const totalAmount = computedLineItems.reduce((s, li) => s + li.amount, 0);

  async function handleSave() {
    if (!invoice) return;
    setSaving(true);
    const result = await updateFieldWorkerInvoice(invoice.id, {
      invoiceNumber,
      paymentDueDate: paymentDueDate || undefined,
      lineItems: computedLineItems,
      totalHours,
      totalAmount,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this invoice — check your connection and try again.");
      return;
    }
    showSuccessToast("Invoice updated");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!invoice) return;
    deleteFieldWorkerInvoice(invoice.id);
    onOpenChange(false);
  }

  function projectLabel(li: FieldWorkerInvoiceLineItem) {
    return projects.find((p) => p.id === li.projectId)?.projectName ?? li.projectName ?? "—";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice — {invoice?.employeeName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice #</Label>
            <Input id="invoiceNumber" className="mt-1.5" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="paymentDueDate">Payment Due Date</Label>
            <Input id="paymentDueDate" type="date" className="mt-1.5" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Project</th>
                <th className="px-2 py-2 font-medium min-w-[9rem]">Billing Entity</th>
                <th className="px-2 py-2 font-medium min-w-[10rem]">Activity</th>
                <th className="px-2 py-2 font-medium w-24">Cost Code</th>
                <th className="px-2 py-2 font-medium w-20">Reg Hrs</th>
                <th className="px-2 py-2 font-medium w-20">OT Hrs</th>
                <th className="px-2 py-2 font-medium w-24">Reg Rate</th>
                <th className="px-2 py-2 font-medium w-24">OT Rate</th>
                <th className="px-2 py-2 font-medium w-24 text-right">Amount</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {computedLineItems.map((li, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(li.date)}</td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">{projectLabel(li)}</td>
                  <td className="p-1">
                    <Select value={li.billingEntityId ?? ""} onValueChange={(v) => updateLineItem(index, { billingEntityId: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-1">
                    <Input className="h-8 text-xs" value={li.activity} onChange={(e) => updateLineItem(index, { activity: e.target.value })} />
                  </td>
                  <td className="p-1">
                    <Input className="h-8 text-xs" value={li.costCode ?? ""} onChange={(e) => updateLineItem(index, { costCode: e.target.value })} />
                  </td>
                  <td className="p-1">
                    <Input type="number" className="h-8 text-xs" value={li.regularHours} onChange={(e) => updateLineItem(index, { regularHours: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="p-1">
                    <Input type="number" className="h-8 text-xs" value={li.overtimeHours} onChange={(e) => updateLineItem(index, { overtimeHours: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="p-1">
                    <Input type="number" className="h-8 text-xs" value={li.regularRate} onChange={(e) => updateLineItem(index, { regularRate: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="p-1">
                    <Input type="number" className="h-8 text-xs" value={li.overtimeRate} onChange={(e) => updateLineItem(index, { overtimeRate: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="px-2 py-1.5 text-right text-xs font-medium text-foreground whitespace-nowrap">
                    {li.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </td>
                  <td className="p-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => removeLineItem(index)}>
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium text-foreground">Total: {totalHours}h</span>
          <span className="text-base font-semibold text-foreground">
            {totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </span>
        </div>

        <DialogFooter className="justify-between">
          {invoice ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this invoice?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete Invoice
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
