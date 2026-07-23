"use client";

import * as React from "react";
import { Upload, AlertTriangle, FileText, ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useVendors } from "@/hooks/use-vendors";
import { parseQuotePdfFile } from "@/lib/procurement/import/parse-quote-file";
import type { ParsedQuoteFields } from "@/lib/procurement/import/shared";
import type { VendorQuoteResponse } from "@/types/procurement";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: pre-selects the RFQ, e.g. when opened from a specific RFQ row. */
  initialRfqId?: string;
}

type Stage = "pick" | "parsing" | "review" | "done";

export function ImportQuoteDialog({ open, onOpenChange, initialRfqId }: Props) {
  const rfqs = useRFQs();
  const vendors = useVendors();
  const [rfqId, setRfqId] = React.useState(initialRfqId ?? "");
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [parsed, setParsed] = React.useState<ParsedQuoteFields | null>(null);
  const [showRawText, setShowRawText] = React.useState(false);

  // Editable review-step fields
  const [vendorId, setVendorId] = React.useState("");
  const [quotedPrice, setQuotedPrice] = React.useState("");
  const [leadTimeDays, setLeadTimeDays] = React.useState("");
  const [freight, setFreight] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [warranty, setWarranty] = React.useState("");
  const [validityPeriodDays, setValidityPeriodDays] = React.useState("");
  const [submittedDate, setSubmittedDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) setRfqId(initialRfqId ?? "");
  }, [open, initialRfqId]);

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setParsed(null);
    setShowRawText(false);
    setVendorId("");
    setQuotedPrice("");
    setLeadTimeDays("");
    setFreight("");
    setTax("");
    setWarranty("");
    setValidityPeriodDays("");
    setSubmittedDate("");
    setNotes("");
  }

  const rfq = rfqs.find((r) => r.id === rfqId);
  const invitedVendors = rfq ? vendors.filter((v) => rfq.vendorIds.includes(v.id)) : [];

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rfq) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      setError("Please upload a .pdf file — that's the only format the parser can read right now.");
      return;
    }

    setError("");
    setFileName(file.name);
    setStage("parsing");

    try {
      const result = await parseQuotePdfFile(file, rfq.vendorIds, vendors);
      setParsed(result);
      setVendorId(result.vendorId ?? "");
      setQuotedPrice(result.quotedPrice != null ? String(result.quotedPrice) : "");
      setLeadTimeDays(result.leadTimeDays != null ? String(result.leadTimeDays) : "");
      setFreight(result.freight != null ? String(result.freight) : "");
      setTax(result.tax != null ? String(result.tax) : "");
      setWarranty(result.warranty);
      setValidityPeriodDays(result.validityPeriodDays != null ? String(result.validityPeriodDays) : "");
      setSubmittedDate(result.submittedDate);
      setNotes(result.notes);
      setStage("review");
    } catch {
      setError("Something went wrong reading that PDF. Please double-check the file and try again.");
      setStage("pick");
    }
  }

  function handleConfirm() {
    if (!rfq || !vendorId || !quotedPrice || !leadTimeDays) return;
    const input: Omit<VendorQuoteResponse, "overallScore"> = {
      vendorId,
      quotedPrice: parseFloat(quotedPrice),
      leadTimeDays: parseInt(leadTimeDays, 10),
      freight: freight ? parseFloat(freight) : undefined,
      tax: tax ? parseFloat(tax) : undefined,
      warranty: warranty || undefined,
      validityPeriodDays: validityPeriodDays ? parseInt(validityPeriodDays, 10) : undefined,
      submittedDate: submittedDate || new Date().toISOString().slice(0, 10),
      notes: notes || undefined,
    };
    upsertQuoteResponse(rfq.id, input);
    setStage("done");
  }

  const canConfirm = !!vendorId && !!quotedPrice && !!leadTimeDays;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Quote (PDF)</DialogTitle>
          <DialogDescription>
            Reads price, lead time, freight, tax, and warranty off the document to save
            manual entry. Nothing is saved until you review and confirm below.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="flex flex-col gap-4">
            <div>
              <Label>RFQ this quote is for</Label>
              <Select value={rfqId} onValueChange={setRfqId}>
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
            </div>

            <label
              className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center ${
                rfq ? "cursor-pointer hover:bg-accent/40" : "cursor-not-allowed opacity-50"
              }`}
            >
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {rfq ? "Click to choose a PDF, or drag one here" : "Select an RFQ first"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">.pdf only, for now</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={!rfq}
                onChange={handleFileSelect}
              />
            </label>

            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">A note on reliability</p>
              <p className="mt-1">
                This scans the PDF&apos;s text for keywords like &quot;Total&quot;,
                &quot;Lead Time&quot;, &quot;Freight&quot;, and &quot;Warranty&quot; — it&apos;s
                a rule-based reader, not a live AI model. It does well on typical vendor
                quote layouts but every field lands in an editable review step so you can
                fix anything it got wrong before it&apos;s saved.
              </p>
            </div>
          </div>
        )}

        {stage === "parsing" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <FileText className="size-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Reading {fileName}…</p>
          </div>
        )}

        {stage === "review" && parsed && (
          <div className="flex flex-col gap-4">
            {parsed.warnings.length > 0 && (
              <div className="flex flex-col gap-1.5 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">
                {parsed.warnings.map((w, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}

            <div>
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {invitedVendors.map((v) => (
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

            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowRawText((s) => !s)}
            >
              <ChevronDown className={`size-3.5 transition-transform ${showRawText ? "rotate-180" : ""}`} />
              {showRawText ? "Hide" : "Show"} extracted text
            </button>
            {showRawText && (
              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                {parsed.rawText}
              </pre>
            )}
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Quote saved</p>
            <p className="text-sm text-muted-foreground">
              {vendors.find((v) => v.id === vendorId)?.vendorName}&apos;s quote on{" "}
              {rfq?.rfqNumber} is now in the Quotes and Quote Comparison tabs.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>
                Save Quote
              </Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
