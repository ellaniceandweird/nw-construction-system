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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRFQs } from "@/hooks/use-rfqs";
import { upsertQuoteResponse } from "@/lib/procurement/rfq-store";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { VendorQuoteResponse } from "@/types/procurement";

interface Props {
  /**
   * When provided, the RFQ is locked to this one (e.g. opened from an RFQ
   * row). When omitted, the dialog shows an RFQ picker — used when opened
   * as a standalone "Add Quote" from the Quotes tab, e.g. as a manual
   * fallback if a PDF upload's parsing goes wrong.
   */
  initialRfqId?: string;
  /** Pre-selects a vendor and prefills the form if that vendor already quoted. */
  vendorId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteResponseDialog({ initialRfqId, vendorId, open, onOpenChange }: Props) {
  const rfqs = useRFQs();
  const [selectedRfqId, setSelectedRfqId] = React.useState("");
  const [selectedVendorId, setSelectedVendorId] = React.useState("");
  const [quotedPrice, setQuotedPrice] = React.useState("");
  const [leadTimeDays, setLeadTimeDays] = React.useState("");
  const [freight, setFreight] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [warranty, setWarranty] = React.useState("");
  const [validityPeriodDays, setValidityPeriodDays] = React.useState("");
  const [submittedDate, setSubmittedDate] = React.useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = React.useState("");

  const rfqLocked = !!initialRfqId;
  const rfq = rfqs.find((r) => r.id === selectedRfqId);

  React.useEffect(() => {
    if (!open) return;
    setSelectedRfqId(initialRfqId ?? "");
  }, [open, initialRfqId]);

  React.useEffect(() => {
    if (!rfq) {
      setSelectedVendorId("");
      return;
    }
    const existing = vendorId ? rfq.responses.find((r) => r.vendorId === vendorId) : undefined;
    setSelectedVendorId(vendorId ?? existing?.vendorId ?? "");
    setQuotedPrice(existing ? String(existing.quotedPrice) : "");
    setLeadTimeDays(existing ? String(existing.leadTimeDays) : "");
    setFreight(existing?.freight != null ? String(existing.freight) : "");
    setTax(existing?.tax != null ? String(existing.tax) : "");
    setWarranty(existing?.warranty ?? "");
    setValidityPeriodDays(existing?.validityPeriodDays != null ? String(existing.validityPeriodDays) : "");
    setSubmittedDate(existing?.submittedDate ?? new Date().toISOString().slice(0, 10));
    setNotes(existing?.notes ?? "");
  }, [rfq, vendorId]);

  function handleSave() {
    if (!rfq || !selectedVendorId || !quotedPrice || !leadTimeDays) return;
    const input: Omit<VendorQuoteResponse, "overallScore"> = {
      vendorId: selectedVendorId,
      quotedPrice: parseFloat(quotedPrice),
      leadTimeDays: parseInt(leadTimeDays, 10),
      freight: freight ? parseFloat(freight) : undefined,
      tax: tax ? parseFloat(tax) : undefined,
      warranty: warranty || undefined,
      validityPeriodDays: validityPeriodDays ? parseInt(validityPeriodDays, 10) : undefined,
      submittedDate,
      notes: notes || undefined,
    };
    upsertQuoteResponse(rfq.id, input);
    onOpenChange(false);
  }

  const availableVendors = rfq
    ? MOCK_VENDORS.filter((v) => rfq.vendorIds.includes(v.id))
    : [];
  const canSave = !!rfq && !!selectedVendorId && !!quotedPrice && !!leadTimeDays;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rfqLocked ? `Log Quote — ${rfq?.rfqNumber}` : "Add Quote"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>RFQ</Label>
            {rfqLocked ? (
              <p className="mt-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                {rfq?.rfqNumber} — {MOCK_PROJECTS.find((p) => p.id === rfq?.projectId)?.projectName}
              </p>
            ) : (
              <Select value={selectedRfqId} onValueChange={setSelectedRfqId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select an RFQ" />
                </SelectTrigger>
                <SelectContent>
                  {rfqs.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.rfqNumber} — {MOCK_PROJECTS.find((p) => p.id === r.projectId)?.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Vendor</Label>
            <Select
              value={selectedVendorId}
              onValueChange={setSelectedVendorId}
              disabled={!!vendorId || !rfq}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder={rfq ? "Select vendor" : "Select an RFQ first"} />
              </SelectTrigger>
              <SelectContent>
                {availableVendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.vendorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quotedPrice">Quoted Price ($)</Label>
              <Input
                id="quotedPrice"
                type="number"
                className="mt-1.5"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                className="mt-1.5"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="tax">Tax ($, optional)</Label>
              <Input
                id="tax"
                type="number"
                className="mt-1.5"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warranty">Warranty (optional)</Label>
              <Input
                id="warranty"
                className="mt-1.5"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="validityPeriodDays">Quote Valid For (days, optional)</Label>
              <Input
                id="validityPeriodDays"
                type="number"
                className="mt-1.5"
                value={validityPeriodDays}
                onChange={(e) => setValidityPeriodDays(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="submittedDate">Date Received</Label>
            <Input
              id="submittedDate"
              type="date"
              className="mt-1.5"
              value={submittedDate}
              onChange={(e) => setSubmittedDate(e.target.value)}
            />
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
            Save Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
