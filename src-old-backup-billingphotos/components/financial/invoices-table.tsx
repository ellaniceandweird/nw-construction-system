"use client";
import * as React from "react";
import { Pencil, Plus, Download } from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { exportToExcel } from "@/lib/financial/export-excel";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceEditDialog } from "@/components/financial/invoice-edit-dialog";
import type { Invoice } from "@/types/financial";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  issued: "bg-info-soft text-info-foreground",
  partially_paid: "bg-warning-soft text-warning-foreground",
  paid: "bg-success-soft text-success",
  overdue: "bg-destructive-soft text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};
function currency(n: number) { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function projectName(id: string) { return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id; }

export function InvoicesTable() {
  const invoices = useInvoices();
  const [editing, setEditing] = React.useState<Invoice | null>(null);
  const [creating, setCreating] = React.useState(false);
  const sorted = [...invoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  function handleExport() {
    exportToExcel(
      `invoices-${new Date().toISOString().slice(0, 10)}`,
      "Invoices",
      sorted.map((inv) => ({
        "Invoice #": inv.invoiceNumber,
        Property: projectName(inv.projectId),
        Vendor: inv.client,
        "Invoice Date": formatDate(inv.invoiceDate),
        "Due Date": formatDate(inv.dueDate),
        "Payment Terms": inv.paymentTerms ?? "",
        Amount: inv.totalAmount,
        Status: inv.invoiceStatus.replace(/_/g, " "),
      }))
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Vendor invoices to pay — accounts payable, since Nice &amp; Weird manages its
          own properties internally rather than billing external clients.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="size-3.5" /> Export to Excel
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-3.5" /> New Invoice
          </Button>
        </div>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => (
              <tr key={inv.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(inv.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(inv.totalAmount)}</td>
                <td className="px-4 py-3"><Badge className={`${STATUS_CLASS[inv.invoiceStatus]} border-transparent`}>{inv.invoiceStatus.replace(/_/g, " ")}</Badge></td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => setEditing(inv)}><Pencil className="size-3.5" /></Button></td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No invoices yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <InvoiceEditDialog invoice={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <InvoiceEditDialog invoice={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
