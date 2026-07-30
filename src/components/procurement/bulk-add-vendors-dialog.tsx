"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVendorsBulk } from "@/lib/procurement/vendor-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Vendor } from "@/types/procurement";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSupplierType?: NonNullable<Vendor["supplierType"]>;
}

const COLUMNS = [
  { key: "vendorName", label: "Name" },
  { key: "vendorCategory", label: "Category / Trade" },
  { key: "primaryContact", label: "Contact Person" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "Zip" },
  { key: "website", label: "Website" },
  { key: "notes", label: "Notes" },
] as const;

type RowData = Record<(typeof COLUMNS)[number]["key"], string>;

function emptyRow(): RowData {
  return {
    vendorName: "", vendorCategory: "", primaryContact: "", phone: "", email: "",
    address: "", city: "", state: "", zip: "", website: "", notes: "",
  };
}

export function BulkAddVendorsDialog({ open, onOpenChange, defaultSupplierType }: Props) {
  const [rows, setRows] = React.useState<RowData[]>(() => Array.from({ length: 5 }, emptyRow));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setRows(Array.from({ length: 5 }, emptyRow));
  }, [open]);

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [COLUMNS[colIndex].key]: value };
      return next;
    });
  }

  // Spreadsheet-style paste: pasting into any cell fills that cell and
  // however many rows/columns of pasted data follow, growing the grid
  // if needed — matching how pasting into Google Sheets/Excel behaves.
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return; // single value — let default paste happen
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

  const filledRows = rows.filter((r) => r.vendorName.trim());

  async function handleImport() {
    if (filledRows.length === 0) return;
    setSaving(true);
    const result = await createVendorsBulk(
      filledRows.map((r) => ({
        vendorName: r.vendorName,
        vendorCategory: r.vendorCategory || "General",
        primaryContact: r.primaryContact || undefined,
        phone: r.phone || undefined,
        email: r.email || undefined,
        address: r.address || undefined,
        city: r.city || undefined,
        state: r.state || undefined,
        zip: r.zip || undefined,
        website: r.website || undefined,
        notes: r.notes || undefined,
        supplierType: defaultSupplierType,
      }))
    );
    setSaving(false);
    if (result.failed.length > 0) {
      showErrorToast(`Added ${result.succeeded}, but ${result.failed.length} row(s) failed — check your connection and try those again.`);
      if (result.succeeded > 0) onOpenChange(false);
      return;
    }
    showSuccessToast(`${result.succeeded} added`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Bulk Add {defaultSupplierType === "subcontractor" ? "Subcontractors" : "Vendors"}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Copy a range of cells from Google Sheets or Excel and paste into any cell below —
          it'll fill in the matching rows and columns automatically. Only rows with a Name
          filled in will be imported.
        </p>
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
                      <Input
                        className="h-8 min-w-[7rem] border-transparent bg-transparent text-xs focus:border-input focus:bg-background"
                        value={row[col.key]}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                      />
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
