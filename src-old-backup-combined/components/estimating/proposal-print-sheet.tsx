"use client";

import * as React from "react";

import { getDivisionLabel, getDivisionSortKey } from "@/lib/estimating/csi-divisions";
import { computeLineItemSubtotal } from "@/lib/estimating/estimate-calculations";
import type { Estimate, EstimateLineItem } from "@/types/estimating";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const CONTINGENCY_LABELS: Record<string, string> = {
  designContingencyPercent: "Design Contingency",
  constructionContingencyPercent: "Construction Contingency",
  escalationPercent: "Escalation",
  corporateOverheadPercent: "Overhead",
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

/**
 * Client-facing proposal — deliberately leaves out labor/material/
 * equipment/subcontract cost breakdown and any Actual-to-date/variance
 * tracking, since those are internal figures. Only visible when printing
 * (hidden on screen), same convention as the Schedule module's print
 * tables: hidden print:block.
 */
export function ProposalPrintSheet({ estimate, projectName }: Props) {
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
    <div className="hidden print:block">
      <div className="mb-6 border-b border-black/40 pb-4">
        <h1 className="text-xl font-semibold">Nice &amp; Weird Group</h1>
        <p className="text-sm text-black/70">Construction Proposal</p>
      </div>

      <div className="mb-6 flex justify-between text-sm">
        <div>
          <p className="font-semibold">{projectName}</p>
          {estimate.address && <p>{estimate.address}</p>}
          {estimate.client && <p>Prepared for: {estimate.client}</p>}
        </div>
        <div className="text-right">
          <p>Proposal #{estimate.proposalNumber || estimate.estimateNumber}</p>
          <p>{new Date(estimate.estimateDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p>Revision {estimate.revision}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black/40 text-left">
            <th className="py-1.5 pr-3">Item</th>
            <th className="py-1.5 pr-3">Description</th>
            <th className="py-1.5 pr-3 text-right">Qty</th>
            <th className="py-1.5 pr-3">Unit</th>
            <th className="py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {divisionKeys.map((key) => {
            const items = grouped.get(key)!;
            return (
              <React.Fragment key={key}>
                <tr>
                  <td colSpan={5} className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide">
                    {getDivisionLabel(items[0].costCode)}
                  </td>
                </tr>
                {items.map((li, i) => {
                  itemNumber += 1;
                  return (
                    <tr key={i} className="border-b border-black/15">
                      <td className="py-1.5 pr-3">{itemNumber}</td>
                      <td className="py-1.5 pr-3">{li.description}</td>
                      <td className="py-1.5 pr-3 text-right">{li.quantity.toLocaleString()}</td>
                      <td className="py-1.5 pr-3">{li.unit}</td>
                      <td className="py-1.5 text-right">{currency(li.totalCost)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col gap-1 border-t border-black/40 pt-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{currency(subtotal)}</span>
        </div>
        {contingencyRows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <span>{row.label} ({row.pct}%)</span>
            <span>{currency(row.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-black/40 pt-1 text-base font-semibold">
          <span>Total</span>
          <span>{currency(estimate.totalEstimatedCost)}</span>
        </div>
      </div>

      {estimate.notes && (
        <div className="mt-6 text-xs text-black/70">
          <p className="font-semibold">Notes</p>
          <p>{estimate.notes}</p>
        </div>
      )}
    </div>
  );
}
