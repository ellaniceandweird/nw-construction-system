"use client";

import * as React from "react";
import { Upload, AlertTriangle, FileSpreadsheet, Trash2 } from "lucide-react";

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
import { createBillingEntity } from "@/lib/financial/billing-entity-store";
import { parseBillingEntitiesExcelFile } from "@/lib/financial/import/parse-billing-entities-excel";
import { parseBillingEntitiesPdfFile } from "@/lib/financial/import/parse-billing-entities-pdf";
import type { ParsedBillingEntityRow } from "@/lib/financial/import/parse-billing-entities-excel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

export function ImportBillingEntitiesDialog({ open, onOpenChange }: Props) {
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<ParsedBillingEntityRow[]>([]);

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setWarnings([]);
    setRows([]);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv", "pdf"].includes(ext)) {
      setError("Please upload a .xlsx, .xls, .csv, or .pdf file.");
      return;
    }

    setError("");
    setFileName(file.name);
    setStage("parsing");

    try {
      const result = ext === "pdf" ? await parseBillingEntitiesPdfFile(file) : await parseBillingEntitiesExcelFile(file);
      setRows(result.rows);
      setWarnings(result.warnings);
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check it and try again.");
      setStage("pick");
    }
  }

  function updateRow(index: number, patch: Partial<ParsedBillingEntityRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    for (const row of rows) {
      createBillingEntity(row);
    }
    setStage("done");
  }

  const canConfirm = rows.length > 0 && rows.every((r) => r.companyName);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Billing Entities</DialogTitle>
          <DialogDescription>
            Upload an Excel, CSV, or PDF list of entities — matched by columns like
            Company Name, Legal Name, Tax ID, Address, Payment Terms. Nothing saves until
            you review and confirm.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center hover:bg-accent/40">
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Click to choose a file, or drag one here</p>
                <p className="mt-1 text-xs text-muted-foreground">.xlsx, .xls, .csv, or .pdf</p>
              </div>
              <input type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" onChange={handleFileSelect} />
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
                Excel/CSV parses reliably with a header row. PDFs are best-effort — only
                company names come through, everything else needs a quick manual fill-in
                during review.
              </p>
            </div>
          </div>
        )}

        {stage === "parsing" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <FileSpreadsheet className="size-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Reading {fileName}…</p>
          </div>
        )}

        {stage === "review" && (
          <div className="flex flex-col gap-4">
            {warnings.length > 0 && (
              <div className="flex flex-col gap-1.5 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">
                {warnings.map((w, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {rows.length} entit{rows.length === 1 ? "y" : "ies"} found — edit anything below before saving.
            </p>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <Label className="text-xs">Company Name</Label>
                    <Input className="mt-1" value={r.companyName} onChange={(e) => updateRow(i, { companyName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Legal Name</Label>
                    <Input className="mt-1" value={r.legalName ?? ""} onChange={(e) => updateRow(i, { legalName: e.target.value })} />
                  </div>
                  <Button variant="ghost" size="icon" className="self-end" onClick={() => removeRow(i)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input className="mt-1" value={r.address ?? ""} onChange={(e) => updateRow(i, { address: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Payment Terms</Label>
                    <Input className="mt-1" placeholder="e.g. Net 30" value={r.defaultPaymentTerms ?? ""} onChange={(e) => updateRow(i, { defaultPaymentTerms: e.target.value })} />
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No entities parsed from this file.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Entities imported</p>
            <p className="text-sm text-muted-foreground">Added {rows.length} entit{rows.length === 1 ? "y" : "ies"}.</p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>Save {rows.length} Entit{rows.length === 1 ? "y" : "ies"}</Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
