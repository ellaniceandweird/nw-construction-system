import type { Project } from "@/types/project";
import type { Property } from "@/types/maintenance";
import type { Estimate } from "@/types/estimating";
import type { ChangeOrder } from "@/types/change-orders";
import type { Budget, CostTransaction, Invoice } from "@/types/financial";
import type { MaintenanceTask } from "@/types/maintenance";
import type { PurchaseOrder } from "@/types/procurement";
import type { Contact } from "@/types/contacts";
import type { ProjectDocument } from "@/types/documents";
import { computePortfolioTotals } from "@/lib/estimating/portfolio-rollup";
import { computeFinancialRollup } from "@/lib/financial/financial-rollup";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * Builds a compact, plain-text summary of the real state of the business
 * — projects, budgets, actual spend, open maintenance, properties — for
 * the AI Assistant to answer questions from. This is real data, not a
 * canned demo; the assistant only knows what's in this digest, and is
 * instructed to say so when a question falls outside it.
 */
export function buildDataDigest(
  projects: Project[],
  properties: Property[],
  estimates: Estimate[],
  changeOrders: ChangeOrder[],
  purchaseOrders: PurchaseOrder[],
  budgets: Budget[],
  transactions: CostTransaction[],
  invoices: Invoice[],
  maintenanceTasks: MaintenanceTask[],
  contacts: Contact[],
  documents: ProjectDocument[]
): string {
  const portfolio = computePortfolioTotals(estimates, purchaseOrders, changeOrders);
  const financial = computeFinancialRollup(budgets, transactions);

  const projectLines = projects.map((p) => {
    const estimate = estimates.find((e) => e.projectId === p.id);
    return `- ${p.projectName} (${p.projectNumber}) — status: ${p.calculatedStatus}, health: ${p.healthScore}/100, ${p.completionPercent}% complete, approved budget ${currency(p.approvedBudget)}, actual cost to date ${currency(p.actualCostToDate ?? 0)}${estimate ? `, estimate ${estimate.estimateNumber} (${estimate.estimateStatus})` : ""}`;
  }).join("\n");

  const propertyLines = properties.map((p) => `- ${p.name}${p.address ? ` (${p.address})` : ""}`).join("\n");

  const openTasks = maintenanceTasks.filter((t) => t.taskStatus !== "complete");
  const taskLines = openTasks.slice(0, 40).map((t) => `- [${t.taskStatus}] ${t.taskDescription} — ${t.propertyName ?? "unspecified property"}${t.priority ? `, priority: ${t.priority}` : ""}`).join("\n");

  const changeOrderLines = changeOrders.map((c) => `- ${c.changeOrderNumber}: ${c.description} (${c.costImpact >= 0 ? "+" : ""}${currency(c.costImpact)}, ${c.changeOrderStatus})`).join("\n");

  const outstandingInvoices = invoices.filter((i) => i.invoiceStatus !== "paid" && i.invoiceStatus !== "cancelled");
  const invoiceLines = outstandingInvoices.map((i) => `- ${i.invoiceNumber}: ${i.client}, ${currency(i.totalAmount)}, due ${i.dueDate}, status: ${i.invoiceStatus}`).join("\n");

  const contactsByCategory: Record<string, number> = {};
  for (const c of contacts) contactsByCategory[c.category] = (contactsByCategory[c.category] ?? 0) + 1;

  return `
NICE & WEIRD GROUP — CURRENT BUSINESS SNAPSHOT

PORTFOLIO TOTALS (Estimating)
Total properties: ${properties.length}
Total projects: ${projects.length}
Original estimated (all projects with an estimate): ${currency(portfolio.totalOriginalEstimated)}
Approved changes: ${currency(portfolio.totalApprovedChanges)}
Revised budget: ${currency(portfolio.totalRevisedBudget)}
Actual spend (from Procurement POs): ${currency(portfolio.totalActual)}

FINANCIAL TRACKING TOTALS
Total budget (Financial module budgets): ${currency(financial.totalBudget)}
Actual spent (Cost Ledger): ${currency(financial.totalActualSpent)}
Remaining: ${currency(financial.totalRemaining)}

PROJECTS (${projects.length})
${projectLines}

PROPERTIES (${properties.length})
${propertyLines}

OPEN MAINTENANCE TASKS (${openTasks.length} total, showing up to 40)
${taskLines || "None."}

CHANGE ORDERS (${changeOrders.length})
${changeOrderLines || "None."}

OUTSTANDING VENDOR INVOICES (${outstandingInvoices.length})
${invoiceLines || "None."}

CONTACTS (${contacts.length} total)
${Object.entries(contactsByCategory).map(([cat, count]) => `- ${cat.replace(/_/g, " ")}: ${count}`).join("\n") || "None."}

DOCUMENTS ON FILE
${documents.length} documents in the Documents registry.
`.trim();
}
