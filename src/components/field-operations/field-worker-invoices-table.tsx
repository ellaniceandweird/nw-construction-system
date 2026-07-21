"use client";
import * as React from "react";
import { Sparkles, ChevronRight, Trash2, Download, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFieldWorkerInvoices } from "@/hooks/use-field-worker-invoices";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyForBillingEntity } from "@/lib/properties/property-relations";
import { deleteFieldWorkerInvoice } from "@/lib/field-operations/field-worker-invoice-store";
import { exportToExcel } from "@/lib/financial/export-excel";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { GenerateInvoicesDialog } from "@/components/field-operations/generate-invoices-dialog";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function FieldWorkerInvoicesTable() {
  const invoices = useFieldWorkerInvoices();
  const billingEntities = useBillingEntities();
  const properties = useProperties();
  const [generating, setGenerating] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...invoices].sort((a, b) => b.payPeriodEnd.localeCompare(a.payPeriodEnd));

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
          Project: projectName(li.projectId),
          Activity: li.activity,
          "Cost Code": li.costCode ?? "",
          "Regular Hours": li.regularHours,
          "Overtime Hours": li.overtimeHours,
          "Regular Rate": li.regularRate,
          "Overtime Rate": li.overtimeRate,
          Amount: li.amount,
        }))
      )
    );
  }

  function handlePrintInvoice(invoiceId: string) {
    const inv = sorted.find((i) => i.id === invoiceId);
    if (!inv) return;
    const billingEntity = billingEntities.find((b) => b.id === inv.billingEntityId);
    const rows = inv.lineItems
      .map(
        (li) => `
        <tr>
          <td>${formatDate(li.date)}</td>
          <td>${projectName(li.projectId)}</td>
          <td>${li.activity}</td>
          <td>${li.costCode ?? "—"}</td>
          <td>${li.regularHours}</td>
          <td>${li.overtimeHours}</td>
          <td class="right">${currency(li.amount)}</td>
        </tr>`
      )
      .join("");

    openPrintWindow(
      `Invoice ${inv.invoiceNumber}`,
      `
      <div class="header">
        <h1>Nice &amp; Weird Group</h1>
        <p>Field Worker Invoice — ${inv.employeeName}${inv.trade ? ` (${inv.trade})` : ""}</p>
        <p>Pay Period: ${formatDate(inv.payPeriodStart)} – ${formatDate(inv.payPeriodEnd)}</p>
        ${billingEntity ? `<p>Billing Entity: ${billingEntity.companyName}</p>` : ""}
      </div>
      <table>
        <thead><tr><th>Date</th><th>Project</th><th>Activity</th><th>Cost Code</th><th>Reg Hrs</th><th>OT Hrs</th><th class="right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:12px; text-align:right; font-weight:700;">Total: ${currency(inv.totalAmount)}</div>
      `
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Auto-generated from real crew hours in Daily Logs, using rates from References.
          One invoice per worker per pay period.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="size-3.5" /> Export to Excel</Button>
          <Button size="sm" onClick={() => setGenerating(true)}><Sparkles className="size-3.5" /> Generate Invoices</Button>
        </div>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Billing Entity</th>
              <th className="px-4 py-3 font-medium">Pay Period</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
              <th className="px-4 py-3 font-medium">Total Amount</th>
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {getPropertyForBillingEntity(inv.billingEntityId, properties)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {billingEntities.find((b) => b.id === inv.billingEntityId)?.companyName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.payPeriodStart)} – {formatDate(inv.payPeriodEnd)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.totalHours.toFixed(1)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{currency(inv.totalAmount)}</td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(inv.id)}><Printer className="size-3.5" /></Button></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => deleteFieldWorkerInvoice(inv.id)}><Trash2 className="size-3.5 text-destructive" /></Button></td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="bg-muted/20 px-4 pb-4 pt-1">
                        <Card className="overflow-x-auto py-0">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium">Date</th>
                                <th className="px-4 py-2.5 font-medium">Project</th>
                                <th className="px-4 py-2.5 font-medium">Activity</th>
                                <th className="px-4 py-2.5 font-medium">Cost Code</th>
                                <th className="px-4 py-2.5 font-medium">Reg Hrs</th>
                                <th className="px-4 py-2.5 font-medium">OT Hrs</th>
                                <th className="px-4 py-2.5 font-medium">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.lineItems.map((li, i) => (
                                <tr key={i} className="border-b border-border/60 last:border-0">
                                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(li.date)}</td>
                                  <td className="px-4 py-2.5 text-foreground">{projectName(li.projectId)}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.activity}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.costCode ?? "—"}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.regularHours}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{li.overtimeHours}</td>
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
              <tr><td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">No invoices generated yet — click &quot;Generate Invoices&quot; above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <GenerateInvoicesDialog open={generating} onOpenChange={setGenerating} />
    </>
  );
}
