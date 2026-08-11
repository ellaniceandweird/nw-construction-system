"use client";

import * as React from "react";
import { Upload, AlertTriangle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRFQs } from "@/hooks/use-rfqs";
import { useVendors } from "@/hooks/use-vendors";
import { parseQuotePdfFile } from "@/lib/procurement/import/parse-quote-file";
import type { ParsedQuoteFields } from "@/lib/procurement/import/shared";
import { QuoteResponseDialog } from "@/components/procurement/quote-response-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "error";

export function UploadQuotePdfDialog({ open, onOpenChange }: Props) {
  const rfqs = useRFQs();
  const vendors = useVendors();
  const [rfqId, setRfqId] = React.useState("");
  const [stage, setStage] = React.useState<Stage>("pick");
  const [error, setError] = React.useState("");
  const [parsed, setParsed] = React.useState<ParsedQuoteFields | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  function reset() {
    setRfqId("");
    setStage("pick");
    setError("");
    setParsed(null);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rfqId) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file — image formats (JPG, PNG) aren't supported yet, only PDF quotes.");
      setStage("error");
      return;
    }
    const rfq = rfqs.find((r) => r.id === rfqId);
    if (!rfq) return;
    setStage("parsing");
    try {
      const result = await parseQuotePdfFile(file, rfq.vendorIds, vendors);
      setParsed(result);
      setReviewOpen(true);
      onOpenChange(false);
    } catch (err) {
      setError("Couldn't read that PDF — it may be a scanned image rather than real text. Try the manual entry option instead.");
      setStage("error");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Quote (PDF)</DialogTitle>
            <DialogDescription>
              Pulls likely fields (price, lead time, freight, tax, warranty) from a vendor's
              PDF quote automatically — you'll still review and confirm every field before
              it's saved. Scanned image PDFs with no real text usually won't parse well.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label>Which RFQ is this quote for?</Label>
            <Select value={rfqId} onValueChange={setRfqId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select RFQ" /></SelectTrigger>
              <SelectContent>
                {rfqs.map((r) => (<SelectItem key={r.id} value={r.id}>{r.rfqNumber} — {r.materialList.slice(0, 40)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {stage === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive-soft p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label htmlFor="quotePdfFile" className="sr-only">Quote PDF</Label>
            <label
              htmlFor="quotePdfFile"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-sm text-muted-foreground hover:border-primary hover:text-primary ${!rfqId ? "pointer-events-none opacity-50" : ""}`}
            >
              <Upload className="size-4" />
              {stage === "parsing" ? "Reading PDF…" : "Click to choose a PDF file"}
            </label>
            <input id="quotePdfFile" type="file" accept="application/pdf" className="hidden" disabled={!rfqId || stage === "parsing"} onChange={handleFileSelect} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {parsed && (
        <QuoteResponseDialog
          initialRfqId={rfqId}
          vendorId={parsed.vendorId ?? undefined}
          prefill={{
            quotedPrice: parsed.quotedPrice,
            leadTimeDays: parsed.leadTimeDays,
            freight: parsed.freight,
            tax: parsed.tax,
            warranty: parsed.warranty,
            validityPeriodDays: parsed.validityPeriodDays,
            submittedDate: parsed.submittedDate,
            notes: parsed.warnings.length ? `Parsed from PDF — please double check: ${parsed.warnings.join("; ")}` : "Parsed from PDF — please double check all fields.",
          }}
          open={reviewOpen}
          onOpenChange={(o) => { setReviewOpen(o); if (!o) reset(); }}
        />
      )}
    </>
  );
}
