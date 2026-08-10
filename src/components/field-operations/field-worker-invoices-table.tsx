"use client";
import * as React from "react";
import { Sparkles, ChevronRight, Trash2, Download, Printer, Search, ArrowUpDown, Pencil } from "lucide-react";
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
import { useFieldWorkerInvoices } from "@/hooks/use-field-worker-invoices";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { deleteFieldWorkerInvoice } from "@/lib/field-operations/field-worker-invoice-store";
import { exportToExcel } from "@/lib/financial/export-excel";
import { openPrintWindow, escapeHtml } from "@/lib/estimating/print-window";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { getBillingEntityIdForProject } from "@/lib/properties/property-relations";
import { GenerateInvoicesDialog } from "@/components/field-operations/generate-invoices-dialog";
import { FieldWorkerInvoiceEditDialog } from "@/components/field-operations/field-worker-invoice-edit-dialog";
import type { Project } from "@/types/project";
import type { FieldWorkerInvoice } from "@/types/field-worker-invoices";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string, projects: Project[], fallbackName?: string) {
  return projects.find((p) => p.id === id)?.projectName ?? fallbackName ?? "—";
}

export function FieldWorkerInvoicesTable() {
  const projects = useProjects();
  const properties = useProperties();
  const allInvoices = useFieldWorkerInvoices();
  const billingEntities = useBillingEntities();
  const [generating, setGenerating] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<FieldWorkerInvoice | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"period_desc" | "period_asc" | "amount_desc" | "amount_asc">("period_desc");

  const filtered = allInvoices.filter((inv) =>
    !search || inv.employeeName.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "period_asc":
        return a.payPeriodEnd.localeCompare(b.payPeriodEnd);
      case "amount_desc":
        return b.totalAmount - a.totalAmount;
      case "amount_asc":
        return a.totalAmount - b.totalAmount;
      default:
        return b.payPeriodEnd.localeCompare(a.payPeriodEnd);
    }
  });

  function billingEntityName(id: string | undefined, projectId: string) {
    let resolvedId = id;
    if (!resolvedId) {
      const project = projects.find((p) => p.id === projectId);
      resolvedId = project ? getBillingEntityIdForProject(project, properties) : undefined;
    }
    if (!resolvedId) return "—";
    return billingEntities.find((b) => b.id === resolvedId)?.companyName ?? "—";
  }

  function handleExport() {
    exportToExcel(
      `field-worker-invoices-${new Date().toISOString().slice(0, 10)}`,
      "Field Worker Invoices",
      sorted.flatMap((inv) =>
        inv.lineItems.map((li) => ({
          "Invoice #": inv.invoiceNumber,
          Employee: inv.employeeName,
          Trade: inv.trade,
          "Pay Period": `${formatDate(inv.payPeriodStart)} – ${formatDate(inv.payPeriodEnd)}`,
          Date: formatDate(li.date),
          "Billing Entity": billingEntityName(li.billingEntityId, li.projectId),
          Project: projectName(li.projectId, projects, li.projectName),
          "Cost Code": li.costCode ?? "",
          "Work Performed": li.activity,
          "Regular Hours": li.regularHours,
          "Overtime Hours": li.overtimeHours,
          Rate: li.regularRate,
          Amount: li.amount,
        }))
      )
    );
  }

  function handlePrintInvoice(invoiceId: string) {
    const inv = sorted.find((i) => i.id === invoiceId);
    if (!inv) return;
    const rows = inv.lineItems
      .map(
        (li, i) => `
        <tr style="${i % 2 === 1 ? "background:#f9fafb;" : ""}">
          <td>${formatDate(li.date)}</td>
          <td>${escapeHtml(billingEntityName(li.billingEntityId, li.projectId))}</td>
          <td>${escapeHtml(projectName(li.projectId, projects, li.projectName))}</td>
          <td>${escapeHtml(li.costCode ?? "—")}</td>
          <td>${escapeHtml(li.activity)}</td>
          <td class="right">${li.regularHours}</td>
          <td class="right">${li.overtimeHours}</td>
          <td class="right">${currency(li.regularRate)}</td>
          <td class="right">${currency(li.overtimeRate)}</td>
          <td class="right">${currency(li.amount)}</td>
        </tr>`
      )
      .join("");

    const totalRegHours = inv.lineItems.reduce((s, li) => s + li.regularHours, 0);
    const totalOtHours = inv.lineItems.reduce((s, li) => s + li.overtimeHours, 0);

    openPrintWindow(
      `${inv.invoiceNumber} ${inv.employeeName}`,
      `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111827; padding-bottom:16px; margin-bottom:20px;">
        <div>
          <h1 style="font-size:20px; margin:0 0 2px;">Nice &amp; Weird Group</h1>
          <p style="margin:0; color:#6b7280;">Field Worker Invoice</p>
        </div>
        <div style="text-align:right; font-size:13px; color:#374151;">
          <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">${escapeHtml(inv.invoiceNumber)}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div>
          <p style="margin:0; font-size:10px; text-transform:uppercase; letter-spacing:0.04em; color:#9ca3af;">Worker</p>
          <p style="margin:2px 0 0; font-size:14px; font-weight:600; color:#111827;">${escapeHtml(inv.employeeName)}</p>
        </div>
        <div>
          <p style="margin:0; font-size:10px; text-transform:uppercase; letter-spacing:0.04em; color:#9ca3af;">Pay Period</p>
          <p style="margin:2px 0 0; font-size:14px; font-weight:600; color:#111827;">${formatDate(inv.payPeriodStart)} – ${formatDate(inv.payPeriodEnd)}</p>
        </div>
        <div>
          <p style="margin:0; font-size:10px; text-transform:uppercase; letter-spacing:0.04em; color:#9ca3af;">Payment Due</p>
          <p style="margin:2px 0 0; font-size:14px; font-weight:600; color:#111827;">${inv.paymentDueDate ? formatDate(inv.paymentDueDate) : "—"}</p>
        </div>
      </div>

      <table style="border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
        <thead><tr><th>Date</th><th>Billing Entity</th><th>Project</th><th>Cost Code</th><th>Work Performed</th><th class="right">Reg Hrs</th><th class="right">OT Hrs</th><th class="right">Reg Rate</th><th class="right">OT Rate</th><th class="right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:flex; justify-content:flex-end; margin-top:16px;">
        <div style="width:260px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px; color:#4b5563;">
            <span>Regular Hours</span><span>${totalRegHours}h</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px; color:#4b5563;">
            <span>Overtime Hours</span><span>${totalOtHours}h</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:10px 0 0; margin-top:6px; border-top:2px solid #111827; font-size:15px; font-weight:700; color:#111827;">
            <span>Total Due</span><span>${currency(inv.totalAmount)}</span>
          </div>
        </div>
      </div>
      `
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Auto-generated from real crew hours in Daily Logs, using rates from References.
          One invoice per worker per pay period — billing entity is looked up per line item
          from the project&apos;s property, since one worker can cross projects/billing
          entities within a pay period.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="size-3.5" /> Export to Excel</Button>
          <Button size="sm" onClick={() => setGenerating(true)}><Sparkles className="size-3.5" /> Generate Invoices</Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[190px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="period_desc">Pay Period (Newest)</SelectItem>
            <SelectItem value="period_asc">Pay Period (Oldest)</SelectItem>
            <SelectItem value="amount_desc">Amount (Highest)</SelectItem>
            <SelectItem value="amount_asc">Amount (Lowest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {allInvoices.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Pay Period</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
              <th className="px-4 py-3 font-medium">Total Amount</th>
              <th className="px-4 py-3 font-medium">Edit</th>
              <th className="px-4 py-3 font-medium">Print</th>
              <th className="px-4 py-3 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => {
              const isExpanded = expandedId === inv.id;
              return (
                <React.Fragment key={inv.id}>
                  <tr className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary hover:underline" onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                        <ChevronRight className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground">{inv.employeeName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.payPeriodStart)} – {formatDate(inv.payPeriodEnd)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.totalHours.toFixed(1)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{currency(inv.totalAmount)}</td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => setEditingInvoice(inv)}><Pencil className="size-3.5" /></Button></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(inv.id)}><Printer className="size-3.5" /></Button></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => deleteFieldWorkerInvoice(inv.id)}><Trash2 className="size-3.5 text-destructive" /></Button></td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="bg-muted/20 px-4 pb-4 pt-1">
                        <Card className="overflow-x-auto py-0">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium">Date</th>
                                <th className="px-4 py-2.5 font-medium">Billing Entity</th>
                                <th className="px-4 py-2.5 font-medium">Project</th>
                                <th className="px-4 py-2.5 font-medium">Cost Code</th>
                                <th className="px-4 py-2.5 font-medium">Work Performed</th>
                                <th className="px-4 py-2.5 font-medium">Reg Hrs</th>
                                <th className="px-4 py-2.5 font-medium">OT Hrs</th>
                                <th className="px-4 py-2.5 font-medium">Rate</th>
                                <th className="px-4 py-2.5 font-medium">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.lineItems.map((li, i) => (
                                <tr key={i} className="border-b border-border/60 last:border-0">
                                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(li.date)}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{billingEntityName(li.billingEntityId, li.projectId)}</td>
                                  <td className="px-4 py-2.5 text-foreground">{projectName(li.projectId, projects, li.projectName)}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.costCode ?? "—"}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.activity}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.regularHours}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.overtimeHours}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{currency(li.regularRate)}</td>
                                  <td className="px-4 py-2.5 font-medium text-foreground">{currency(li.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Card>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">No invoices generated yet — click &quot;Generate Invoices&quot; above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <GenerateInvoicesDialog open={generating} onOpenChange={setGenerating} />
      <FieldWorkerInvoiceEditDialog invoice={editingInvoice} open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)} />
    </>
  );
}
