import { getDivisionLabel, getDivisionSortKey } from "@/lib/estimating/csi-divisions";
import { computeLineItemSubtotal } from "@/lib/estimating/estimate-calculations";
import { escapeHtml } from "@/lib/estimating/print-window";
import type { Estimate, EstimateLineItem, TakeoffItem } from "@/types/estimating";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function buildEstimatesListHtml(
  estimates: Estimate[],
  projectName: (id: string) => string
): string {
  const rows = estimates
    .map(
      (e) => `
      <tr>
        <td>${escapeHtml(projectName(e.projectId))}</td>
        <td>${escapeHtml(e.estimateNumber)}</td>
        <td>${formatDate(e.estimateDate)}</td>
        <td>Rev ${e.revision}</td>
        <td>${escapeHtml(e.estimateStatus.replace(/_/g, " "))}</td>
        <td class="right">${currency(e.totalEstimatedCost)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="header">
      <h1>Nice &amp; Weird Group</h1>
      <p>Estimates</p>
    </div>
    <table>
      <thead>
        <tr><th>Project</th><th>Estimate #</th><th>Date</th><th>Rev</th><th>Status</th><th class="right">Total</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function buildTakeoffListHtml(
  items: TakeoffItem[],
  projectName: (id: string) => string
): string {
  const byProject = new Map<string, TakeoffItem[]>();
  for (const t of items) {
    if (!byProject.has(t.projectId)) byProject.set(t.projectId, []);
    byProject.get(t.projectId)!.push(t);
  }
  const projectIds = [...byProject.keys()].sort((a, b) => projectName(a).localeCompare(projectName(b)));

  const sections = projectIds
    .map((projectId) => {
      const rows = byProject
        .get(projectId)!
        .map(
          (t) => `
          <tr>
            <td>${escapeHtml(t.description)}</td>
            <td>${escapeHtml(t.costCode ?? "—")}</td>
            <td>${t.quantity.toLocaleString()} ${escapeHtml(t.unit)}</td>
            <td>${t.wasteFactorPercent != null ? `${t.wasteFactorPercent}%` : "—"}</td>
            <td>${t.adjustedQuantity.toLocaleString()} ${escapeHtml(t.unit)}</td>
          </tr>`
        )
        .join("");
      return `
        <h2>${escapeHtml(projectName(projectId))}</h2>
        <table>
          <thead>
            <tr><th>Description</th><th>Cost Code</th><th>Quantity</th><th>Waste %</th><th>Adjusted Qty</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .join("");

  return `
    <div class="header">
      <h1>Nice &amp; Weird Group</h1>
      <p>Takeoff</p>
    </div>
    ${sections}
  `;
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

export function buildEstimateDetailHtml(estimate: Estimate, projectName: string): string {
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

  const sections = divisionKeys
    .map((key) => {
      const items = grouped.get(key)!;
      const rows = items
        .map((li) => {
          itemNumber += 1;
          return `
            <tr>
              <td>${itemNumber}</td>
              <td>${escapeHtml(li.description)}</td>
              <td>${li.quantity.toLocaleString()}</td>
              <td>${escapeHtml(li.unit)}</td>
              <td class="right">${currency(li.totalCost)}</td>
            </tr>`;
        })
        .join("");
      return `
        <h3>${escapeHtml(getDivisionLabel(items[0].costCode))}</h3>
        <table>
          <thead><tr><th>Item</th><th>Description</th><th>Qty</th><th>Unit</th><th class="right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .join("");

  const contingencyHtml = contingencyRows
    .map(
      (row) => `
      <tr><td colspan="4">${escapeHtml(row.label)} (${row.pct}%)</td><td class="right">${currency(row.amount)}</td></tr>`
    )
    .join("");

  return `
    <div class="header">
      <h1>Nice &amp; Weird Group</h1>
      <p>Estimate — ${escapeHtml(projectName)}</p>
      ${estimate.address ? `<p>${escapeHtml(estimate.address)}</p>` : ""}
      ${estimate.client ? `<p>Owner: ${escapeHtml(estimate.client)}</p>` : ""}
    </div>
    <table>
      <tbody>
        <tr><td>Estimate #</td><td class="right">${escapeHtml(estimate.proposalNumber || estimate.estimateNumber)}</td></tr>
        <tr><td>Date</td><td class="right">${formatDate(estimate.estimateDate)}</td></tr>
        <tr><td>Revision</td><td class="right">${estimate.revision}</td></tr>
      </tbody>
    </table>
    ${sections}
    <table>
      <tbody>
        <tr class="subtotal-row"><td colspan="4">Subtotal</td><td class="right">${currency(subtotal)}</td></tr>
        ${contingencyHtml}
        <tr class="total-row"><td colspan="4">Total</td><td class="right">${currency(estimate.totalEstimatedCost)}</td></tr>
      </tbody>
    </table>
    ${estimate.notes ? `<h3>Notes</h3><p>${escapeHtml(estimate.notes)}</p>` : ""}
  `;
}
