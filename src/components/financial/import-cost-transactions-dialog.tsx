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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCostTransactionsBulk } from "@/lib/financial/cost-transaction-store";
import { parseCostTransactionsExcelFile } from "@/lib/financial/import/parse-cost-transactions-excel";
import { parseCostTransactionsPdfFile } from "@/lib/financial/import/parse-cost-transactions-pdf";
import { showErrorToast } from "@/lib/toast/toast-store";
import { useProjects } from "@/hooks/use-projects";
import type { ParsedCostTransactionRow } from "@/lib/financial/import/parse-cost-transactions-excel";
import type { CostTransaction } from "@/types/financial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

const CATEGORY_OPTIONS: CostTransaction["category"][] = ["labor", "material", "equipment", "subcontract", "miscellaneous"];

export function ImportCostTransactionsDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<ParsedCostTransactionRow[]>([]);
  const [savedCount, setSavedCount] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setWarnings([]);
    setRows([]);
    setSavedCount(0);
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
      const result = ext === "pdf" ? await parseCostTransactionsPdfFile(file) : await parseCostTransactionsExcelFile(file);
      setRows(result.rows);
      setWarnings(result.warnings);
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check it and try again.");
      setStage("pick");
    }
  }

  function updateRow(index: number, patch: Partial<ParsedCostTransactionRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    setSaving(true);
    const result = await createCostTransactionsBulk(
      rows.map((r) => {
        const project = projects.find((p) => p.projectName.toLowerCase() === r.projectName.trim().toLowerCase());
        return {
          projectId: project?.id ?? "",
          description: r.description,
          costCode: r.costCode || "",
          category: (CATEGORY_OPTIONS.find((c) => c === r.category?.toLowerCase()) as CostTransaction["category"]) ?? "miscellaneous",
          date: r.date,
          amount: r.amount,
          referenceNumber: r.referenceNumber || undefined,
        };
      })
    );
    setSaving(false);
    if (result.failed.length > 0) {
      showErrorToast(`Saved ${result.succeeded}, but ${result.failed.length} row(s) failed — check your connection and try those again.`);
      if (result.succeeded === 0) return;
    }
    setSavedCount(result.succeeded);
    setStage("done");
  }

  const canConfirm = rows.length > 0 && rows.every((r) => r.description && r.amount > 0);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Cost Entries</DialogTitle>
          <DialogDescription>
            Upload an Excel, CSV, or PDF list of costs — matched by columns like Project, Date,
            Description, Cost Code, Category, Amount, Reference #. Nothing saves until you
            review and confirm.
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
                Excel/CSV parses reliably with a header row for Project, Date, Description, Cost
                Code, Category, and Amount. PDFs are best-effort — only description and amount
                come through per line, everything else needs a quick manual fill-in during review.
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
              {rows.length} entr{rows.length === 1 ? "y" : "ies"} found — edit anything below before saving. Project must match a real project name exactly, or it'll be saved without one linked.
            </p>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input className="mt-1" value={r.description} onChange={(e) => updateRow(i, { description: e.target.value })} />
                  </div>
                  <Button variant="ghost" size="icon" className="self-end" onClick={() => removeRow(i)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                  <div>
                    <Label className="text-xs">Project</Label>
                    <Input className="mt-1" value={r.projectName} onChange={(e) => updateRow(i, { projectName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" className="mt-1" value={r.date} onChange={(e) => updateRow(i, { date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Cost Code</Label>
                    <Input className="mt-1" value={r.costCode ?? ""} onChange={(e) => updateRow(i, { costCode: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select value={r.category ?? "miscellaneous"} onValueChange={(v) => updateRow(i, { category: v })}>
                      <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORY_OPTIONS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Amount</Label>
                    <Input type="number" className="mt-1" value={r.amount} onChange={(e) => updateRow(i, { amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No cost entries parsed from this file.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Cost entries imported</p>
            <p className="text-sm text-muted-foreground">Added {savedCount} entr{savedCount === 1 ? "y" : "ies"}.</p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm || saving}>
                {saving ? "Saving…" : `Save ${rows.length} Entr${rows.length === 1 ? "y" : "ies"}`}
              </Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
