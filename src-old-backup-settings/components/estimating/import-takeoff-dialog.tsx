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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTakeoffItem } from "@/lib/estimating/takeoff-store";
import { parseTakeoffExcelFile } from "@/lib/estimating/import/parse-takeoff-excel";
import type { ParsedTakeoffRow } from "@/lib/estimating/import/parse-takeoff-excel";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

export function ImportTakeoffDialog({ open, onOpenChange }: Props) {
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<ParsedTakeoffRow[]>([]);
  const [hasProjectColumn, setHasProjectColumn] = React.useState(false);
  const [fallbackProjectId, setFallbackProjectId] = React.useState("");

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setWarnings([]);
    setRows([]);
    setHasProjectColumn(false);
    setFallbackProjectId("");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      setError("Please upload a .xlsx, .xls, or .csv file.");
      return;
    }

    setError("");
    setFileName(file.name);
    setStage("parsing");

    try {
      const result = await parseTakeoffExcelFile(file);
      setRows(result.rows);
      setWarnings(result.warnings);
      setHasProjectColumn(result.hasProjectColumn);
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check it and try again.");
      setStage("pick");
    }
  }

  function updateRow(index: number, patch: Partial<ParsedTakeoffRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function resolvedProjectId(row: ParsedTakeoffRow): string {
    return row.projectId || fallbackProjectId;
  }

  function handleConfirm() {
    for (const row of rows) {
      const projectId = resolvedProjectId(row);
      if (!projectId) continue;
      createTakeoffItem({
        projectId,
        description: row.description,
        location: row.location,
        costCode: row.costCode,
        measurementType: "custom",
        unit: row.unit,
        quantity: row.quantity,
        wasteFactorPercent: row.wasteFactorPercent,
      });
    }
    setStage("done");
  }

  const unresolvedCount = rows.filter((r) => !resolvedProjectId(r)).length;
  const canConfirm = rows.length > 0 && unresolvedCount === 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Takeoff</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV quantity takeoff — matched by columns like Task/
            Description, Cost Code, Quantity, Unit. Nothing saves until you review and confirm.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center hover:bg-accent/40">
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Click to choose a file, or drag one here</p>
                <p className="mt-1 text-xs text-muted-foreground">.xlsx, .xls, or .csv</p>
              </div>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
            </label>
            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
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

            {!hasProjectColumn && (
              <div>
                <Label>This file has no Project column — apply all rows to</Label>
                <Select value={fallbackProjectId} onValueChange={setFallbackProjectId}>
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
            )}

            {hasProjectColumn && unresolvedCount > 0 && (
              <p className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {unresolvedCount} row{unresolvedCount === 1 ? "" : "s"} couldn&apos;t be matched to a project by name — fix those below before saving.
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              {rows.length} item{rows.length === 1 ? "" : "s"} found — edit anything below before saving.
            </p>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className="rounded-md border border-border p-2">
                  {hasProjectColumn && (
                    <div className="mb-2">
                      <Label className="text-xs">Project</Label>
                      <Select value={resolvedProjectId(r) || undefined} onValueChange={(v) => updateRow(i, { projectId: v })}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder={r.projectNameGuess ? `"${r.projectNameGuess}" — no match, pick one` : "Select project"} />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PROJECTS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_90px_70px_100px_auto]">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input className="mt-1" value={r.description} onChange={(e) => updateRow(i, { description: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" className="mt-1" value={r.quantity} onChange={(e) => updateRow(i, { quantity: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input className="mt-1" value={r.unit} onChange={(e) => updateRow(i, { unit: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Cost Code</Label>
                      <Input className="mt-1" value={r.costCode ?? ""} onChange={(e) => updateRow(i, { costCode: e.target.value })} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No items parsed from this file.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Takeoff items imported</p>
            <p className="text-sm text-muted-foreground">Added {rows.length} item{rows.length === 1 ? "" : "s"}.</p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>Save {rows.length} Item{rows.length === 1 ? "" : "s"}</Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
