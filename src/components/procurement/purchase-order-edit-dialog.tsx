"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

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
import { updatePurchaseOrder, createPurchaseOrder, computeTotal } from "@/lib/procurement/purchase-order-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useVendors } from "@/hooks/use-vendors";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import type { PurchaseOrder, PurchaseOrderLineItem, PurchaseOrderStatus } from "@/types/procurement";

interface Props {
  order: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true and order is null, the dialog opens in create mode instead of doing nothing. */
  createMode?: boolean;
}

const STATUS_OPTIONS: { value: PurchaseOrderStatus; label: string }[] = [
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "partially_delivered", label: "Partially Delivered" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function emptyLineItem(): PurchaseOrderLineItem {
  return { description: "", quantity: 1, unit: "each", unitPrice: 0, extendedPrice: 0 };
}

export function PurchaseOrderEditDialog({ order, open, onOpenChange, createMode }: Props) {
  const billingEntities = useBillingEntities();
  const vendors = useVendors();
  const [projectId, setProjectId] = React.useState("");
  const [vendorId, setVendorId] = React.useState("");
  const [billingEntityId, setBillingEntityId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = React.useState("");
  const [terms, setTerms] = React.useState("");
  const [poStatus, setPoStatus] = React.useState<PurchaseOrderStatus>("approved");
  const [tax, setTax] = React.useState("");
  const [freight, setFreight] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [lineItems, setLineItems] = React.useState<PurchaseOrderLineItem[]>([emptyLineItem()]);

  React.useEffect(() => {
    if (order) {
      setProjectId(order.projectId);
      setVendorId(order.vendorId);
      setBillingEntityId(order.billingEntityId);
      setOrderDate(order.orderDate);
      setExpectedDelivery(order.expectedDelivery ?? "");
      setTerms(order.terms ?? "");
      setPoStatus(order.poStatus);
      setTax(order.tax != null ? String(order.tax) : "");
      setFreight(order.freight != null ? String(order.freight) : "");
      setNotes(order.notes ?? "");
      setLineItems(order.lineItems.length ? order.lineItems : [emptyLineItem()]);
    } else if (open && createMode) {
      setProjectId("");
      setVendorId("");
      setBillingEntityId("");
      setOrderDate(new Date().toISOString().slice(0, 10));
      setExpectedDelivery("");
      setTerms("");
      setPoStatus("approved");
      setTax("");
      setFreight("");
      setNotes("");
      setLineItems([emptyLineItem()]);
    }
  }, [order, open, createMode]);

  function updateLineItem(index: number, patch: Partial<PurchaseOrderLineItem>) {
    setLineItems((prev) =>
      prev.map((li, i) => {
        if (i !== index) return li;
        const next = { ...li, ...patch };
        next.extendedPrice = next.quantity * next.unitPrice;
        return next;
      })
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const previewTotal = computeTotal({
    lineItems,
    tax: tax ? parseFloat(tax) : undefined,
    freight: freight ? parseFloat(freight) : undefined,
  });

  function handleSave() {
    if (!projectId || !vendorId || !billingEntityId || !orderDate) return;
    const input = {
      projectId,
      vendorId,
      billingEntityId,
      orderDate,
      expectedDelivery: expectedDelivery || undefined,
      terms: terms || undefined,
      poStatus,
      tax: tax ? parseFloat(tax) : undefined,
      freight: freight ? parseFloat(freight) : undefined,
      notes: notes || undefined,
      lineItems,
    };
    if (order) {
      updatePurchaseOrder(order.id, input);
    } else {
      createPurchaseOrder(input);
    }
    onOpenChange(false);
  }

  const canSave = !!projectId && !!vendorId && !!billingEntityId && !!orderDate && lineItems.every((li) => li.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? `Edit Purchase Order ${order.poNumber}` : "New Purchase Order"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PROJECTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.filter((v) => v.supplierType !== "subcontractor").map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vendorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Billing Entity</Label>
            <Select value={billingEntityId} onValueChange={setBillingEntityId}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select billing entity" />
              </SelectTrigger>
              <SelectContent>
                {billingEntities.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                className="mt-1.5"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expectedDelivery">Delivery Date</Label>
              <Input
                id="expectedDelivery"
                type="date"
                className="mt-1.5"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={poStatus} onValueChange={(v) => setPoStatus(v as PurchaseOrderStatus)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="terms">Terms</Label>
            <Input
              id="terms"
              className="mt-1.5"
              placeholder="e.g. Net 30"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="size-3.5" /> Add Line Item
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {lineItems.map((li, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 items-end gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_80px_80px_100px_100px_auto]"
                >
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      className="mt-1"
                      value={li.description}
                      onChange={(e) => updateLineItem(index, { description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={li.quantity}
                      onChange={(e) => updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unit</Label>
                    <Input
                      className="mt-1"
                      value={li.unit}
                      onChange={(e) => updateLineItem(index, { unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={li.unitPrice}
                      onChange={(e) => updateLineItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Extended</Label>
                    <p className="mt-1 rounded-md border border-transparent px-2 py-2 text-sm text-muted-foreground">
                      {currency(li.extendedPrice)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax">Tax ($, optional)</Label>
              <Input id="tax" type="number" className="mt-1.5" value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="freight">Freight ($, optional)</Label>
              <Input
                id="freight"
                type="number"
                className="mt-1.5"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground">{currency(previewTotal)}</span>
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
          <Button onClick={handleSave} disabled={!canSave}>
            {order ? "Save Changes" : "Create Purchase Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
