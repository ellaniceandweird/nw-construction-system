"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useInvoices } from "@/hooks/use-invoices";
import { useProjects } from "@/hooks/use-projects";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoiceEditDialog } from "@/components/financial/invoice-edit-dialog";
import type { Invoice, InvoiceStatus } from "@/types/financial";

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  issued: "bg-info-soft text-info-foreground",
  partially_paid: "bg-warning-soft text-warning-foreground",
  paid: "bg-success-soft text-success",
  overdue: "bg-destructive-soft text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  issued: "Issued",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InvoicesTable() {
  const invoices = useInvoices();
  const projects = useProjects();
  const billingEntities = useBillingEntities();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Invoice | null>(null);
  const [creating, setCreating] = React.useState(false);

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.projectName ?? "—";
  }
  function entityName(id: string) {
    return billingEntities.find((b) => b.id === id)?.companyName ?? "—";
  }

  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const haystack = `${inv.invoiceNumber} ${inv.client} ${projectName(inv.projectId)}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  const total = sorted.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Vendor and subcontractor invoices — accounts payable tied to real projects and billing entities.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Invoice
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-[12rem] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search invoice #, client, project…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted-foreground">{sorted.length} of {invoices.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Client / Vendor</th>
              <th className="px-4 py-3 font-medium">Billing Entity</th>
              <th className="px-4 py-3 font-medium">Invoice Date</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => (
              <tr key={inv.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(inv.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{entityName(inv.billingEntityId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.invoiceDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3">
                  <Badge className={`border-transparent ${STATUS_CLASS[inv.invoiceStatus]}`}>{STATUS_LABEL[inv.invoiceStatus]}</Badge>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(inv.totalAmount)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(inv)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  {invoices.length === 0 ? "No invoices yet — add the first one above." : "No invoices match your search."}
                </td>
              </tr>
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr className="border-t border-border font-medium text-foreground">
                <td colSpan={7} className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3">{currency(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </Card>

      <InvoiceEditDialog invoice={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <InvoiceEditDialog invoice={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
