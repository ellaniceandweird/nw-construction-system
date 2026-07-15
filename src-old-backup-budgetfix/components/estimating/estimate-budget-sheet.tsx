"use client";

import * as React from "react";

import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { getDivisionLabel, getDivisionSortKey } from "@/lib/estimating/csi-divisions";
import { computeLineItemSubtotal } from "@/lib/estimating/estimate-calculations";
import { computeDivisionBudget, computeTotalActual } from "@/lib/estimating/budget-tracking";
import type { Estimate, EstimateLineItem } from "@/types/estimating";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const CONTINGENCY_LABELS: Record<string, string> = {
  designContingencyPercent: "Design Contingency",
  constructionContingencyPercent: "Construction Contingency",
  escalationPercent: "Escalation",
  corporateOverheadPercent: "Corporate Overhead",
  profitPercent: "Profit",
  bondPercent: "Bond",
  insurancePercent: "Insurance",
  salesTaxPercent: "Sales Tax",
  retainagePercent: "Retainage",
};

const CONTINGENCY_ORDER = [
  "designContingencyPercent",
  "constructionContingencyPercent",
  "escalationPercent",
  "corporateOverheadPercent",
  "profitPercent",
  "bondPercent",
  "insurancePercent",
  "salesTaxPercent",
  "retainagePercent",
] as const;

interface Props {
  estimate: Estimate;
  projectName: string;
}

export function EstimateBudgetSheet({ estimate, projectName }: Props) {
  const purchaseOrders = usePurchaseOrders();
  const projectPOs = purchaseOrders.filter((po) => po.projectId === estimate.projectId);
  const hasActuals = projectPOs.length > 0;
  const divisionBudget = computeDivisionBudget(estimate.lineItems, projectPOs);
  const divisionBudgetByKey = new Map(divisionBudget.map((d) => [d.divisionKey, d]));
  const totalActual = computeTotalActual(projectPOs);
  const totalVariance = estimate.totalEstimatedCost - totalActual;

  const grouped = new Map<string, EstimateLineItem[]>();
  for (const li of estimate.lineItems) {
    const key = getDivisionSortKey(li.costCode);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(li);
  }
  const divisionKeys = [...grouped.keys()].sort();

  const subtotal = computeLineItemSubtotal(estimate.lineItems, estimate.indirectCosts);
  let itemNumber = 0;
  let running = subtotal;

  const contingencyRows = CONTINGENCY_ORDER.filter((key) => estimate.contingency?.[key]).map((key) => {
    const pct = estimate.contingency![key]!;
    const amount = running * (pct / 100);
    running += amount;
    return { label: CONTINGENCY_LABELS[key], pct, amount };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-border pb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{projectName}</h3>
          {estimate.address && <p className="text-xs text-muted-foreground">{estimate.address}</p>}
        </div>
        {hasActuals && (
          <div className="flex gap-4 rounded-md bg-muted/40 px-3 py-2 text-right text-xs">
            <div>
              <p className="text-muted-foreground">Estimated</p>
              <p className="font-mono font-semibold text-foreground">{currency(estimate.totalEstimatedCost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Actual to Date</p>
              <p className="font-mono font-semibold text-foreground">{currency(totalActual)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Variance</p>
              <p className={`font-mono font-semibold ${totalVariance >= 0 ? "text-success" : "text-destructive"}`}>
                {totalVariance >= 0 ? "+" : ""}
                {currency(totalVariance)}
              </p>
            </div>
          </div>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-2 font-medium">Item</th>
            <th className="py-2 pr-2 font-medium">Task</th>
            <th className="py-2 pr-2 font-medium">Cost Code</th>
            <th className="py-2 pr-2 text-right font-medium">Qty</th>
            <th className="py-2 pr-2 font-medium">Unit</th>
            <th className="py-2 pr-2 text-right font-medium">Unit Cost</th>
            <th className="py-2 pr-0 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[13px] tabular-nums">
          {divisionKeys.map((key) => {
            const items = grouped.get(key)!;
            const divisionLabel = getDivisionLabel(items[0].costCode);
            const budget = divisionBudgetByKey.get(key);
            return (
              <React.Fragment key={`div-${key}`}>
                <tr className="border-b border-border/60">
                  <td colSpan={7} className="pt-4 pb-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
                    {divisionLabel}
                  </td>
                </tr>
                {items.map((li, i) => {
                  itemNumber += 1;
                  const unitCost =
                    li.quantity > 0
                      ? (li.laborCost + li.materialCost + li.equipmentCost + li.subcontractCost) / li.quantity
                      : 0;
                  return (
                    <tr key={`${key}-${i}`} className="border-b border-border/30 last:border-0">
                      <td className="py-1.5 pr-2 text-muted-foreground">{itemNumber}</td>
                      <td className="py-1.5 pr-2 font-sans text-foreground">{li.description}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{li.costCode || "—"}</td>
                      <td className="py-1.5 pr-2 text-right text-muted-foreground">{li.quantity.toLocaleString()}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{li.unit}</td>
                      <td className="py-1.5 pr-2 text-right text-muted-foreground">{currency(unitCost)}</td>
                      <td className="py-1.5 pr-0 text-right font-medium text-foreground">{currency(li.totalCost)}</td>
                    </tr>
                  );
                })}
                {hasActuals && budget && (
                  <tr className="border-b border-border/60 bg-muted/30 font-sans text-xs">
                    <td colSpan={5} className="py-1 pr-2 text-right text-muted-foreground">
                      Division actual to date (from Purchase Orders):
                    </td>
                    <td className="py-1 pr-2 text-right text-muted-foreground">{currency(budget.actual)}</td>
                    <td className={`py-1 pr-0 text-right font-medium ${budget.variance >= 0 ? "text-success" : "text-destructive"}`}>
                      {budget.variance >= 0 ? "+" : ""}
                      {currency(budget.variance)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 font-mono text-sm tabular-nums">
        <div className="flex justify-between text-muted-foreground">
          <span className="font-sans">Subtotal</span>
          <span>{currency(subtotal)}</span>
        </div>
        {contingencyRows.map((row) => (
          <div key={row.label} className="flex justify-between text-muted-foreground">
            <span className="font-sans">
              {row.label} ({row.pct}%)
            </span>
            <span>{currency(row.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
          <span className="font-sans">Total</span>
          <span>{currency(estimate.totalEstimatedCost)}</span>
        </div>
      </div>

      {!hasActuals && (
        <p className="mt-3 text-xs text-muted-foreground">
          No Purchase Orders logged for this project yet — actual-to-date tracking will
          appear here once POs exist in Procurement.
        </p>
      )}
    </div>
  );
}
