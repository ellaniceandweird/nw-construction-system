"use client";

import * as React from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCostTransactionsBulk } from "@/lib/financial/cost-transaction-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import { useProjects } from "@/hooks/use-projects";
import { MANUAL_ENTRY } from "@/lib/field-operations/daily-log-store";
import type { CostTransaction } from "@/types/financial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLUMNS = [
  { key: "projectName", label: "Project" },
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  { key: "costCode", label: "Cost Code" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "referenceNumber", label: "Reference #" },
] as const;

type RowData = Record<(typeof COLUMNS)[number]["key"], string>;

function emptyRow(): RowData {
  return { projectName: "", date: "", description: "", costCode: "", category: "", amount: "", referenceNumber: "" };
}

const VALID_CATEGORIES: CostTransaction["category"][] = ["labor", "material", "equipment", "subcontract", "miscellaneous"];

function normalizeCategory(text: string): CostTransaction["category"] {
  const lower = text.trim().toLowerCase();
  return (VALID_CATEGORIES.find((c) => c === lower) as CostTransaction["category"]) ?? "miscellaneous";
}

function normalizeDate(text: string): string {
  const trimmed = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function BulkAddCostTransactionsDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const [rows, setRows] = React.useState<RowData[]>(() => Array.from({ length: 8 }, emptyRow));
  const [saving, setSaving] = React.useState(false);
  const [manualProjectRows, setManualProjectRows] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (open) {
      setRows(Array.from({ length: 8 }, emptyRow));
      setManualProjectRows(new Set());
    }
  }, [open]);

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [COLUMNS[colIndex].key]: value };
      return next;
    });
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return;
    e.preventDefault();
    const pastedRows = text.replace(/\r/g, "").split("\n").filter((r, i, arr) => !(i === arr.length - 1 && r === ""));
    setRows((prev) => {
      const next = [...prev];
      pastedRows.forEach((rowText, i) => {
        const targetRow = rowIndex + i;
        while (next.length <= targetRow) next.push(emptyRow());
        const cells = rowText.split("\t");
        cells.forEach((cellText, j) => {
          const targetCol = colIndex + j;
          if (targetCol < COLUMNS.length) {
            next[targetRow] = { ...next[targetRow], [COLUMNS[targetCol].key]: cellText.trim() };
          }
        });
      });
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const filledRows = rows.filter((r) => r.description.trim() && r.amount.trim());
  const unmatchedProjectRows = filledRows.filter(
    (r) => r.projectName.trim() && !projects.some((p) => p.projectName.toLowerCase() === r.projectName.trim().toLowerCase())
  );

  async function handleImport() {
    if (filledRows.length === 0) return;
    setSaving(true);
    const result = await createCostTransactionsBulk(
      filledRows.map((r) => {
        const project = projects.find((p) => p.projectName.toLowerCase() === r.projectName.trim().toLowerCase());
        return {
          projectId: project?.id ?? "",
          description: r.description,
          costCode: r.costCode || "",
          category: normalizeCategory(r.category),
          date: r.date ? normalizeDate(r.date) : new Date().toISOString().slice(0, 10),
          amount: parseFloat(r.amount) || 0,
          referenceNumber: r.referenceNumber || undefined,
        };
      })
    );
    setSaving(false);
    if (result.failed.length > 0) {
      showErrorToast(`Added ${result.succeeded}, but ${result.failed.length} row(s) failed — check your connection and try those again.`);
      if (result.succeeded > 0) onOpenChange(false);
      return;
    }
    showSuccessToast(`${result.succeeded} cost entries added`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Cost Entries</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Copy a range of cells from Google Sheets or Excel and paste into any cell in the Date,
          Description, Cost Code, Category, Amount, or Reference # columns — it'll fill in the
          matching rows and columns automatically. Project is a dropdown per row (with a Manual
          entry option) rather than pasteable, so pick or type it separately for each row. Only
          rows with a Description and Amount filled in will be imported.
        </p>

        {unmatchedProjectRows.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft p-3 text-sm text-warning-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              {unmatchedProjectRows.length} row(s) have a Project that doesn't match any real project name exactly —
              those entries will be saved without a project linked. Double-check spelling before importing.
            </span>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-2 py-2 font-medium whitespace-nowrap">{c.label}</th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/60 last:border-0">
                  {COLUMNS.map((col, colIndex) => (
                    <td key={col.key} className="p-1">
                      {col.key === "projectName" ? (
                        manualProjectRows.has(rowIndex) ? (
                          <Input
                            className="h-8 min-w-[9rem] text-xs"
                            placeholder="Type project"
                            value={row.projectName}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          />
                        ) : (
                          <Select
                            value={projects.some((p) => p.projectName === row.projectName) ? row.projectName : ""}
                            onValueChange={(v) => {
                              if (v === MANUAL_ENTRY) {
                                setManualProjectRows((prev) => new Set(prev).add(rowIndex));
                                updateCell(rowIndex, colIndex, "");
                                return;
                              }
                              updateCell(rowIndex, colIndex, v);
                            }}
                          >
                            <SelectTrigger className="h-8 min-w-[9rem] text-xs"><SelectValue placeholder="Select project" /></SelectTrigger>
                            <SelectContent>
                              {projects.map((p) => (<SelectItem key={p.id} value={p.projectName}>{p.projectName}</SelectItem>))}
                              <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                            </SelectContent>
                          </Select>
                        )
                      ) : (
                        <Input
                          className="h-8 min-w-[7rem] border-transparent bg-transparent text-xs focus:border-input focus:bg-background"
                          value={row[col.key]}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="p-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => removeRow(rowIndex)}>
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="outline" size="sm" className="w-fit" onClick={addRow}>
          <Plus className="size-3.5" /> Add Row
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={filledRows.length === 0 || saving}>
            {saving ? "Importing…" : `Import ${filledRows.length || ""} ${filledRows.length === 1 ? "Entry" : "Entries"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
