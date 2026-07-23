"use client";

import * as React from "react";
import { Upload, AlertTriangle, FileSpreadsheet, Trash2, Plus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimate, withComputedLineItemTotals } from "@/lib/estimating/estimate-store";
import { parseEstimateExcelFile } from "@/lib/estimating/import/parse-estimate-excel";
import { parseEstimatePdfFile } from "@/lib/estimating/import/parse-estimate-pdf";
import { useProjects } from "@/hooks/use-projects";
import type { ParsedEstimateFile } from "@/lib/estimating/import/shared";
import type { EstimateLineItem } from "@/types/estimating";
import type { Project } from "@/types/project";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

function guessProjectId(nameGuess: string, projects: Project[]): string {
  const normalized = nameGuess.toLowerCase();
  const match = projects.find(
    (p) => normalized.includes(p.projectName.toLowerCase()) || p.projectName.toLowerCase().includes(normalized)
  );
  return match?.id ?? "";
}

export function ImportEstimateDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [parsed, setParsed] = React.useState<ParsedEstimateFile | null>(null);

  const [projectId, setProjectId] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [estimator, setEstimator] = React.useState("");
  const [lineItems, setLineItems] = React.useState<Omit<EstimateLineItem, "totalCost">[]>([]);
  const [constructionContingencyPercent, setConstructionContingencyPercent] = React.useState("");
  const [insurancePercent, setInsurancePercent] = React.useState("");
  const [salesTaxPercent, setSalesTaxPercent] = React.useState("");

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setParsed(null);
    setProjectId("");
    setAddress("");
    setEstimator("");
    setLineItems([]);
    setConstructionContingencyPercent("");
    setInsurancePercent("");
    setSalesTaxPercent("");
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
      const result = ext === "pdf" ? await parseEstimatePdfFile(file) : await parseEstimateExcelFile(file);
      setParsed(result);
      setProjectId(guessProjectId(result.projectNameGuess, projects));
      setAddress(result.addressGuess);
      setLineItems(result.lineItems);
      setConstructionContingencyPercent(
        result.contingency.constructionContingencyPercent != null ? String(result.contingency.constructionContingencyPercent) : ""
      );
      setInsurancePercent(result.contingency.insurancePercent != null ? String(result.contingency.insurancePercent) : "");
      setSalesTaxPercent(result.contingency.salesTaxPercent != null ? String(result.contingency.salesTaxPercent) : "");
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check it and try again.");
      setStage("pick");
    }
  }

  function updateLineItem(index: number, patch: Partial<Omit<EstimateLineItem, "totalCost">>) {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  }
  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }
  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { costCode: "", description: "", quantity: 1, unit: "each", laborCost: 0, materialCost: 0, equipmentCost: 0, subcontractCost: 0, markupPercent: 0 },
    ]);
  }

  function handleConfirm() {
    if (!projectId || lineItems.length === 0) return;
    createEstimate({
      projectId,
      address: address || undefined,
      estimator: estimator || "Unassigned",
      estimateDate: new Date().toISOString().slice(0, 10),
      estimateStatus: "draft",
      lineItems: withComputedLineItemTotals(lineItems),
      contingency: {
        constructionContingencyPercent: constructionContingencyPercent ? parseFloat(constructionContingencyPercent) : undefined,
        insurancePercent: insurancePercent ? parseFloat(insurancePercent) : undefined,
        salesTaxPercent: salesTaxPercent ? parseFloat(salesTaxPercent) : undefined,
      },
      notes: `Imported from ${fileName}`,
    });
    setStage("done");
  }

  const canConfirm = !!projectId && lineItems.length > 0 && lineItems.every((li) => li.description);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Estimate</DialogTitle>
          <DialogDescription>
            Upload an Excel or PDF budget/estimate — it auto-parses line items, quantities,
            and costs. Nothing saves until you review and confirm.
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
                Excel files parse reliably when they have a header row with columns like
                Task, Description, Cost Code, Quantity, Unit, and Unit Cost — the same
                layout as a typical CSI-division budget sheet. PDFs are best-effort since
                they lose real table structure; every parsed line lands in an editable
                review step either way.
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder={parsed.projectNameGuess || "Select project"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {parsed.projectNameGuess && !projectId && (
                  <p className="mt-1 text-xs text-warning-foreground">
                    Detected &quot;{parsed.projectNameGuess}&quot; — couldn&apos;t match it to a project, please pick one.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="estimator">Estimator</Label>
                <Input id="estimator" className="mt-1.5" value={estimator} onChange={(e) => setEstimator(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Line Items ({lineItems.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="size-3.5" /> Add Line Item
                </Button>
              </div>
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {lineItems.map((li, i) => (
                  <div key={i} className="grid grid-cols-1 items-end gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_90px_70px_90px_auto]">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input className="mt-1" value={li.description} onChange={(e) => updateLineItem(i, { description: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" className="mt-1" value={li.quantity} onChange={(e) => updateLineItem(i, { quantity: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input className="mt-1" value={li.unit} onChange={(e) => updateLineItem(i, { unit: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Cost ($)</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        value={li.materialCost + li.subcontractCost}
                        onChange={(e) => updateLineItem(i, { materialCost: parseFloat(e.target.value) || 0, subcontractCost: 0 })}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLineItem(i)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {lineItems.length === 0 && (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No line items parsed — add them manually or try a different file.
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Contingency &amp; Markup (parsed from footer, if present)</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-3 rounded-md border border-border p-3">
                <div>
                  <Label className="text-xs">Construction Contingency %</Label>
                  <Input type="number" className="mt-1" value={constructionContingencyPercent} onChange={(e) => setConstructionContingencyPercent(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Insurance %</Label>
                  <Input type="number" className="mt-1" value={insurancePercent} onChange={(e) => setInsurancePercent(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Sales Tax %</Label>
                  <Input type="number" className="mt-1" value={salesTaxPercent} onChange={(e) => setSalesTaxPercent(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Estimate imported</p>
            <p className="text-sm text-muted-foreground">
              Saved as a new draft estimate with {lineItems.length} line item{lineItems.length === 1 ? "" : "s"}.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>Save Estimate</Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
