"use client";

import * as React from "react";
import { Plus, Trash2, Zap } from "lucide-react";

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
import { createEstimate, updateEstimate, deleteEstimate, withComputedLineItemTotals } from "@/lib/estimating/estimate-store";
import { findRateForCostCode } from "@/lib/estimating/cost-database-store";
import { computeEstimateTotal, computeLineItemTotal } from "@/lib/estimating/estimate-calculations";
import { useCostCodes } from "@/hooks/use-cost-codes";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { Estimate, EstimateLineItem, EstimateStatus } from "@/types/estimating";

interface Props {
  estimate: Estimate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: EstimateStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "internal_review", label: "Internal Review" },
  { value: "owner_review", label: "Owner Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "superseded", label: "Superseded" },
  { value: "archived", label: "Archived" },
];

const NONE = "none";

function emptyLineItem(): Omit<EstimateLineItem, "totalCost"> {
  return { costCode: "", description: "", quantity: 1, unit: "each", laborCost: 0, materialCost: 0, equipmentCost: 0, subcontractCost: 0, markupPercent: 15 };
}
function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

type IndirectCosts = NonNullable<Estimate["indirectCosts"]>;
type Contingency = NonNullable<Estimate["contingency"]>;

const INDIRECT_FIELDS: { key: keyof IndirectCosts; label: string }[] = [
  { key: "generalConditions", label: "General Conditions" },
  { key: "temporaryFacilities", label: "Temporary Facilities" },
  { key: "permits", label: "Permits" },
  { key: "insurance", label: "Insurance" },
  { key: "projectManagement", label: "Project Management" },
  { key: "mobilization", label: "Mobilization" },
  { key: "demobilization", label: "Demobilization" },
  { key: "utilities", label: "Utilities" },
  { key: "cleanup", label: "Cleanup" },
  { key: "officeOverhead", label: "Office Overhead" },
];
const CONTINGENCY_FIELDS: { key: keyof Contingency; label: string }[] = [
  { key: "designContingencyPercent", label: "Design Contingency %" },
  { key: "constructionContingencyPercent", label: "Construction Contingency %" },
  { key: "escalationPercent", label: "Escalation %" },
  { key: "profitPercent", label: "Profit %" },
  { key: "corporateOverheadPercent", label: "Corporate Overhead %" },
  { key: "salesTaxPercent", label: "Sales Tax %" },
  { key: "bondPercent", label: "Bond %" },
  { key: "insurancePercent", label: "Insurance %" },
  { key: "retainagePercent", label: "Retainage %" },
];

export function EstimateEditDialog({ estimate, open, onOpenChange }: Props) {
  const costCodes = useCostCodes();

  const [projectId, setProjectId] = React.useState("");
  const [client, setClient] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [estimator, setEstimator] = React.useState("");
  const [estimateDate, setEstimateDate] = React.useState("");
  const [estimateStatus, setEstimateStatus] = React.useState<EstimateStatus>("draft");
  const [proposalNumber, setProposalNumber] = React.useState("");
  const [taxMethod, setTaxMethod] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [lineItems, setLineItems] = React.useState<Omit<EstimateLineItem, "totalCost">[]>([emptyLineItem()]);
  const [indirectCosts, setIndirectCosts] = React.useState<IndirectCosts>({});
  const [contingency, setContingency] = React.useState<Contingency>({});
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setProjectId(estimate?.projectId ?? "");
    setClient(estimate?.client ?? "");
    setAddress(estimate?.address ?? "");
    setEstimator(estimate?.estimator ?? "");
    setEstimateDate(estimate?.estimateDate ?? new Date().toISOString().slice(0, 10));
    setEstimateStatus(estimate?.estimateStatus ?? "draft");
    setProposalNumber(estimate?.proposalNumber ?? "");
    setTaxMethod(estimate?.taxMethod ?? "");
    setNotes(estimate?.notes ?? "");
    setLineItems(estimate?.lineItems.length ? estimate.lineItems : [emptyLineItem()]);
    setIndirectCosts(estimate?.indirectCosts ?? {});
    setContingency(estimate?.contingency ?? {});
    setConfirmingDelete(false);
  }, [estimate, open]);

  function updateLineItem(index: number, patch: Partial<Omit<EstimateLineItem, "totalCost">>) {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  }
  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }
  function removeLineItem(index: number) {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }
  function applyRate(index: number) {
    const li = lineItems[index];
    const rate = findRateForCostCode(li.costCode);
    if (!rate) return;
    updateLineItem(index, {
      laborCost: rate.laborCost * li.quantity,
      materialCost: rate.materialCost * li.quantity,
      equipmentCost: rate.equipmentCost * li.quantity,
      subcontractCost: rate.subcontractCost * li.quantity,
      markupPercent: rate.profitPercent ?? li.markupPercent,
      unit: rate.unit,
    });
  }

  const computedLineItems = withComputedLineItemTotals(lineItems);
  const previewTotal = computeEstimateTotal(computedLineItems, indirectCosts, contingency);

  function handleSave() {
    if (!projectId || !estimator || !estimateDate || lineItems.some((li) => !li.description)) return;
    const input = {
      projectId, client: client || undefined, address: address || undefined, estimator, estimateDate,
      estimateStatus, proposalNumber: proposalNumber || undefined, taxMethod: taxMethod || undefined,
      notes: notes || undefined, lineItems: computedLineItems, indirectCosts, contingency,
    };
    if (estimate) {
      updateEstimate(estimate.id, input);
    } else {
      createEstimate(input);
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (!estimate) return;
    deleteEstimate(estimate.id);
    onOpenChange(false);
  }

  const canSave = !!projectId && !!estimator && !!estimateDate && lineItems.every((li) => li.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{estimate ? `Edit Estimate ${estimate.estimateNumber}` : "New Estimate"}</DialogTitle>
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
                    <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={estimateStatus} onValueChange={(v) => setEstimateStatus(v as EstimateStatus)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimator">Estimator</Label>
              <Input id="estimator" className="mt-1.5" value={estimator} onChange={(e) => setEstimator(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="estimateDate">Estimate Date</Label>
              <Input id="estimateDate" type="date" className="mt-1.5" value={estimateDate} onChange={(e) => setEstimateDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="proposalNumber">Proposal Number</Label>
              <Input id="proposalNumber" className="mt-1.5" value={proposalNumber} onChange={(e) => setProposalNumber(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Owner (optional)</Label>
              <Input id="client" className="mt-1.5" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="taxMethod">Tax Method (optional)</Label>
            <Input id="taxMethod" className="mt-1.5" placeholder="e.g. Sales tax on materials" value={taxMethod} onChange={(e) => setTaxMethod(e.target.value)} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="size-3.5" /> Add Row
              </Button>
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="min-w-[180px] px-2 py-2 font-medium">Description</th>
                    <th className="min-w-[110px] px-2 py-2 font-medium">Cost Code</th>
                    <th className="min-w-[70px] px-2 py-2 font-medium">Qty</th>
                    <th className="min-w-[70px] px-2 py-2 font-medium">Unit</th>
                    <th className="min-w-[90px] px-2 py-2 font-medium">Labor</th>
                    <th className="min-w-[90px] px-2 py-2 font-medium">Material</th>
                    <th className="min-w-[90px] px-2 py-2 font-medium">Equipment</th>
                    <th className="min-w-[100px] px-2 py-2 font-medium">Subcontract</th>
                    <th className="min-w-[80px] px-2 py-2 font-medium">Markup %</th>
                    <th className="min-w-[80px] px-2 py-2 font-medium">Tax ($)</th>
                    <th className="min-w-[100px] px-2 py-2 font-medium">Total</th>
                    <th className="px-2 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, index) => (
                    <tr key={index} className="border-b border-border/60 last:border-0">
                      <td className="p-1">
                        <Input className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.description} onChange={(e) => updateLineItem(index, { description: e.target.value })} />
                      </td>
                      <td className="p-1">
                        <Select value={li.costCode || NONE} onValueChange={(v) => updateLineItem(index, { costCode: v === NONE ? "" : v })}>
                          <SelectTrigger className="h-8 w-full border-0 shadow-none">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>None</SelectItem>
                            {costCodes.map((c) => (
                              <SelectItem key={c.id} value={c.code}>{c.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.quantity} onChange={(e) => updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.unit} onChange={(e) => updateLineItem(index, { unit: e.target.value })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.laborCost} onChange={(e) => updateLineItem(index, { laborCost: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.materialCost} onChange={(e) => updateLineItem(index, { materialCost: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.equipmentCost} onChange={(e) => updateLineItem(index, { equipmentCost: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.subcontractCost} onChange={(e) => updateLineItem(index, { subcontractCost: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.markupPercent ?? 0} onChange={(e) => updateLineItem(index, { markupPercent: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-1">
                        <Input type="number" className="h-8 border-0 shadow-none focus-visible:ring-1" value={li.tax ?? 0} onChange={(e) => updateLineItem(index, { tax: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="whitespace-nowrap p-1 px-2 text-right font-medium text-foreground">{currency(computeLineItemTotal(li))}</td>
                      <td className="p-1">
                        <div className="flex gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="Apply default rate for this cost code"
                            onClick={() => applyRate(index)}
                            disabled={!findRateForCostCode(li.costCode)}
                          >
                            <Zap className="size-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => removeLineItem(index)} disabled={lineItems.length === 1}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <Label>Indirect Costs (optional)</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-md border border-border p-3 sm:grid-cols-5">
              {INDIRECT_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input type="number" className="mt-1" value={indirectCosts[f.key] ?? ""} onChange={(e) => setIndirectCosts((prev) => ({ ...prev, [f.key]: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Contingency &amp; Markup (optional)</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-md border border-border p-3 sm:grid-cols-5">
              {CONTINGENCY_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input type="number" className="mt-1" value={contingency[f.key] ?? ""} onChange={(e) => setContingency((prev) => ({ ...prev, [f.key]: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
            <span className="text-sm font-medium text-foreground">Total Estimated Cost</span>
            <span className="text-base font-semibold text-foreground">{currency(previewTotal)}</span>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {estimate ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this estimate?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-3.5" /> Delete Estimate
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
