"use client";
import * as React from "react";
import { Pencil, Plus, Upload, Search, ArrowUpDown } from "lucide-react";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldWorkerRateEditDialog } from "@/components/references/field-worker-rate-edit-dialog";
import { ImportFieldWorkerRatesDialog } from "@/components/references/import-field-worker-rates-dialog";
import type { FieldWorkerRate } from "@/types/references";

function currency(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function FieldWorkerRatesTable() {
  const rates = useFieldWorkerRates();
  const [editing, setEditing] = React.useState<FieldWorkerRate | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"name" | "trade" | "rate_desc">("name");

  const filtered = rates.filter((r) =>
    !search || `${r.employeeName} ${r.trade}`.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "trade") return a.trade.localeCompare(b.trade);
    if (sortBy === "rate_desc") return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0);
    return a.employeeName.localeCompare(b.employeeName);
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Source of truth for hourly rates — Field Worker Invoices in Daily Logs pulls
          rates from here automatically.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="size-3.5" /> Import</Button>
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-3.5" /> New Rate</Button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search employee or trade…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="trade">Trade (A-Z)</SelectItem>
            <SelectItem value="rate_desc">Rate (Highest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {rates.length}</span>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="px-4 py-3 font-medium">Hourly Rate</th>
              <th className="px-4 py-3 font-medium">Overtime Rate</th>
              <th className="px-4 py-3 font-medium">Default Cost Code</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{r.employeeName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.trade}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.hourlyRate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.overtimeRate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.defaultCostCode ?? "—"}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Pencil className="size-3.5" /></Button></td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No rates yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <FieldWorkerRateEditDialog rate={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <FieldWorkerRateEditDialog rate={null} open={creating} onOpenChange={setCreating} />
      <ImportFieldWorkerRatesDialog open={importing} onOpenChange={setImporting} />
    </>
  );
}
