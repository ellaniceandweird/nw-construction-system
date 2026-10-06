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
import { useProperties } from "@/hooks/use-properties";
import { addStaffReportLogEntries } from "@/lib/maintenance/maintenance-log-store";
import {
  parseMaintenanceLogExcelFile,
  parseMaintenanceLogPdfFile,
  type ParsedLogRow,
} from "@/lib/maintenance/import/parse-maintenance-log";
import { showErrorToast } from "@/lib/toast/toast-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

export function ImportMaintenanceLogDialog({ open, onOpenChange }: Props) {
  const properties = useProperties();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<ParsedLogRow[]>([]);
  const [addedCount, setAddedCount] = React.useState(0);
  const [skippedCount, setSkippedCount] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  function reset() {
    setStage("pick");
    setFileName("");
    setError("");
    setWarnings([]);
    setRows([]);
    setAddedCount(0);
    setSkippedCount(0);
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
      const result = ext === "pdf" ? await parseMaintenanceLogPdfFile(file) : await parseMaintenanceLogExcelFile(file);
      setRows(result.rows);
      setWarnings(result.warnings);
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check it and try again.");
      setStage("pick");
    }
  }

  function updateRow(index: number, patch: Partial<ParsedLogRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    setSaving(true);
    const result = await addStaffReportLogEntries(rows);
    setSaving(false);
    if (result.failed.length > 0) {
      showErrorToast(`${result.added} saved, but ${result.failed.length} row(s) failed — check your connection and try those again.`);
      if (result.added === 0 && result.skipped === 0) return;
    }
    setAddedCount(result.added);
    setSkippedCount(result.skipped);
    setStage("done");
  }

  const canConfirm = rows.length > 0 && rows.every((r) => r.description && r.date);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Staff Report into Maintenance Log</DialogTitle>
          <DialogDescription>
            Upload your staff&apos;s completion report (Excel, CSV, or PDF). Columns are matched by
            name in any order — Date, Property, Work Done, Completed By, Notes. Each row is logged
            under the date the work was done. Importing the same report again won&apos;t create
            duplicates. Nothing saves until you review and confirm.
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
              {rows.length} entr{rows.length === 1 ? "y" : "ies"} found — edit anything below before saving.
            </p>

            <datalist id="log-import-properties">
              {properties.map((p) => (<option key={p.id} value={p.name} />))}
            </datalist>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-2 sm:grid-cols-[9rem_1fr_1fr_auto]">
                  <div>
                    <Label className="text-xs">Date done</Label>
                    <Input type="date" className="mt-1" value={r.date} onChange={(e) => updateRow(i, { date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Property</Label>
                    <Input className="mt-1" list="log-import-properties" value={r.propertyName} onChange={(e) => updateRow(i, { propertyName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Completed by</Label>
                    <Input className="mt-1" value={r.staffName ?? ""} onChange={(e) => updateRow(i, { staffName: e.target.value })} />
                  </div>
                  <Button variant="ghost" size="icon" className="self-end" onClick={() => removeRow(i)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Work done</Label>
                    <Input className="mt-1" value={r.description} onChange={(e) => updateRow(i, { description: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Notes</Label>
                    <Input className="mt-1" value={r.notes ?? ""} onChange={(e) => updateRow(i, { notes: e.target.value })} />
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No entries found in this file.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Staff report logged</p>
            <p className="text-sm text-muted-foreground">
              {addedCount} new entr{addedCount === 1 ? "y" : "ies"} added to the log
              {skippedCount > 0 && `, ${skippedCount} skipped (already logged)`}.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm || saving}>
                {saving ? "Saving…" : `Log ${rows.length} Entr${rows.length === 1 ? "y" : "ies"}`}
              </Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
