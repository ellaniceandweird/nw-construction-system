"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { createInvoice, updateInvoice, deleteInvoice } from "@/lib/financial/invoice-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Invoice, InvoiceStatus } from "@/types/financial";

interface Props {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "issued", label: "Issued" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export function InvoiceEditDialog({ invoice, open, onOpenChange }: Props) {
  const projects = useProjects();
  const billingEntities = useBillingEntities();
  const [projectId, setProjectId] = React.useState("");
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [billingEntityId, setBillingEntityId] = React.useState("");
  const [client, setClient] = React.useState("");
  const [invoiceDate, setInvoiceDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [paymentTerms, setPaymentTerms] = React.useState("");
  const [preparedBy, setPreparedBy] = React.useState("Ella Esquivel");
  const [invoiceStatus, setInvoiceStatus] = React.useState<InvoiceStatus>("draft");
  const [description, setDescription] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    if (invoice) {
      setProjectId(invoice.projectId);
      setInvoiceNumber(invoice.invoiceNumber);
      setBillingEntityId(invoice.billingEntityId);
      setClient(invoice.client);
      setInvoiceDate(invoice.invoiceDate);
      setDueDate(invoice.dueDate);
      setPaymentTerms(invoice.paymentTerms ?? "");
      setPreparedBy(invoice.preparedBy);
      setInvoiceStatus(invoice.invoiceStatus);
      setDescription(invoice.lineItems[0]?.description ?? "");
      setTotalAmount(String(invoice.totalAmount));
    } else {
      setProjectId("");
      setInvoiceNumber("");
      setBillingEntityId("");
      setClient("");
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setDueDate("");
      setPaymentTerms("Net 30");
      setPreparedBy("Ella Esquivel");
      setInvoiceStatus("draft");
      setDescription("");
      setTotalAmount("");
    }
  }, [invoice, open]);

  function handleProjectChange(value: string) {
    setProjectId(value);
    const project = projects.find((p) => p.id === value);
    if (project?.billingEntityId) setBillingEntityId(project.billingEntityId);
    if (project?.clientName) setClient((prev) => prev || project.clientName);
  }

  async function handleSave() {
    if (!projectId || !invoiceNumber || !billingEntityId || !client || !invoiceDate || !dueDate) return;
    const amount = parseFloat(totalAmount) || 0;
    const input = {
      projectId,
      invoiceNumber,
      billingEntityId,
      client,
      invoiceDate,
      dueDate,
      paymentTerms: paymentTerms || undefined,
      preparedBy,
      invoiceStatus,
      lineItems: [{ description: description || "Invoice", quantity: 1, unit: "LS", unitPrice: amount, amount, total: amount }],
      totalAmount: amount,
    };
    setSaving(true);
    const result = invoice ? await updateInvoice(invoice.id, input) : await createInvoice(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this invoice — check your connection and try again.");
      return;
    }
    showSuccessToast(invoice ? "Invoice updated" : "Invoice added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!invoice) return;
    deleteInvoice(invoice.id);
    onOpenChange(false);
  }

  const canSave = !!projectId && !!invoiceNumber && !!billingEntityId && !!client && !!invoiceDate && !!dueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={handleProjectChange}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" className="mt-1.5" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <Label>Billing Entity</Label>
              <Select value={billingEntityId} onValueChange={setBillingEntityId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select billing entity" /></SelectTrigger>
                <SelectContent>{billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="client">Client / Vendor</Label>
            <Input id="client" className="mt-1.5" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Who this invoice is from or to" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" className="mt-1.5" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" className="mt-1.5" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalAmount">Amount ($)</Label>
              <Input id="totalAmount" type="number" className="mt-1.5" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input id="paymentTerms" className="mt-1.5" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={invoiceStatus} onValueChange={(v) => setInvoiceStatus(v as InvoiceStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preparedBy">Prepared By</Label>
              <Input id="preparedBy" className="mt-1.5" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} />
            </div>
          </div>
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
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
