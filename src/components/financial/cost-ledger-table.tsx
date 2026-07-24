"use client";
import * as React from "react";
import { Plus, Download } from "lucide-react";
import { useCostTransactions } from "@/hooks/use-cost-transactions";
import { useCostLedgerNotes } from "@/hooks/use-cost-ledger-notes";
import { setCostLedgerNote } from "@/lib/financial/cost-ledger-notes-store";
import { exportToExcel } from "@/lib/financial/export-excel";
import { useProjects } from "@/hooks/use-projects";
import { useVendors } from "@/hooks/use-vendors";
import type { Vendor } from "@/types/procurement";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { AddCostTransactionDialog } from "@/components/financial/add-cost-transaction-dialog";
import type { Project } from "@/types/project";

const SOURCE_LABEL: Record<string, string> = {
  procurement: "Procurement",
  field_operations: "Field Ops",
  estimating: "Estimating",
  manual: "Manual",
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string, projects: Project[]) {
  return projects.find((p) => p.id === id)?.projectName ?? id;
}
function vendorName(id: string | undefined, vendors: Vendor[]) {
  if (!id) return "—";
  return vendors.find((v) => v.id === id)?.vendorName ?? id;
}

function NotesCell({ transactionId, initialValue }: { transactionId: string; initialValue: string }) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <Input
      className="h-8 min-w-[10rem] text-xs"
      placeholder="Add a note…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setCostLedgerNote(transactionId, value)}
    />
  );
}

export function CostLedgerTable() {
  const projects = useProjects();
  const allTransactions = useCostTransactions();
  const vendors = useVendors();
  const notes = useCostLedgerNotes();
  const [adding, setAdding] = React.useState(false);
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  const filtered = allTransactions.filter((t) => {
    const matchesProject = projectFilter === "all" || t.projectId === projectFilter;
    const matchesSource = sourceFilter === "all" || t.sourceModule === sourceFilter;
    return matchesProject && matchesSource;
  });

  const transactions = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return a.date.localeCompare(b.date);
      case "amount_desc":
        return b.amount - a.amount;
      case "amount_asc":
        return a.amount - b.amount;
      default:
        return b.date.localeCompare(a.date);
    }
  });

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  function handleExport() {
    exportToExcel(
      `cost-ledger-${new Date().toISOString().slice(0, 10)}`,
      "Cost Ledger",
      transactions.map((t) => ({
        Date: formatDate(t.date),
        Property: projectName(t.projectId, projects),
        Description: t.description,
        "Cost Code": t.costCode || "",
        Vendor: vendorName(t.vendorId, vendors),
        Source: SOURCE_LABEL[t.sourceModule],
        Amount: t.amount,
        Notes: notes[t.id] ?? "",
      }))
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="procurement">Procurement</SelectItem>
            <SelectItem value="field_operations">Field Ops</SelectItem>
            <SelectItem value="estimating">Estimating</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Date (Newest)</SelectItem>
            <SelectItem value="date_asc">Date (Oldest)</SelectItem>
            <SelectItem value="amount_desc">Amount (Highest)</SelectItem>
            <SelectItem value="amount_asc">Amount (Lowest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{transactions.length} of {allTransactions.length}</span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Every real cost hitting a property — Purchase Orders flow in automatically from
          Procurement; add anything that doesn&apos;t (permit fees paid directly, petty
          cash, etc.) manually below.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="size-3.5" /> Export to Excel
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add Manual Entry
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Cost Code</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 text-muted-foreground">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-foreground">{projectName(t.projectId, projects)}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm">{t.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.costCode || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{vendorName(t.vendorId, vendors)}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-muted text-muted-foreground border-transparent">{SOURCE_LABEL[t.sourceModule]}</Badge>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(t.amount)}</td>
                <td className="px-4 py-3">
                  <NotesCell transactionId={t.id} initialValue={notes[t.id] ?? ""} />
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">No cost transactions yet.</td></tr>
            )}
          </tbody>
          {transactions.length > 0 && (
            <tfoot>
              <tr className="border-t border-border font-medium text-foreground">
                <td colSpan={6} className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3">{currency(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </Card>

      <AddCostTransactionDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
