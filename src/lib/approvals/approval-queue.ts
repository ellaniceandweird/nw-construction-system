import type { Budget } from "@/types/financial";
import type { Estimate } from "@/types/estimating";
import type { ChangeOrder } from "@/types/change-orders";
import type { Project } from "@/types/project";

export type ApprovalKind = "budget" | "estimate" | "change_order";

export interface ApprovalItem {
  id: string;
  kind: ApprovalKind;
  kindLabel: string;
  title: string;
  projectName: string;
  amount: number;
  requestedBy: string;
  requestedDate: string;
}

/**
 * Aggregates everything currently awaiting approval — Budgets pending
 * approval, Estimates out for owner review (i.e. quotes), and Change
 * Orders pending review — into one unified list for the Approvals
 * module. Sorted oldest-first so the longest-waiting items surface
 * first.
 */
export function buildApprovalQueue(
  budgets: Budget[],
  estimates: Estimate[],
  changeOrders: ChangeOrder[],
  projects: Project[]
): ApprovalItem[] {
  const projectName = (id: string) => projects.find((p) => p.id === id)?.projectName ?? "—";

  const items: ApprovalItem[] = [];

  for (const b of budgets) {
    if (b.budgetStatus !== "pending_approval") continue;
    items.push({
      id: b.id,
      kind: "budget",
      kindLabel: "Budget",
      title: `Budget rev. ${b.revision}`,
      projectName: projectName(b.projectId),
      amount: b.currentBudget,
      requestedBy: b.preparedBy,
      requestedDate: b.createdDate,
    });
  }

  for (const e of estimates) {
    if (e.estimateStatus !== "owner_review") continue;
    items.push({
      id: e.id,
      kind: "estimate",
      kindLabel: "Quote",
      title: e.estimateNumber,
      projectName: projectName(e.projectId),
      amount: e.totalEstimatedCost,
      requestedBy: e.estimator,
      requestedDate: e.estimateDate,
    });
  }

  for (const c of changeOrders) {
    if (c.changeOrderStatus !== "pending") continue;
    items.push({
      id: c.id,
      kind: "change_order",
      kindLabel: "Change Order",
      title: c.changeOrderNumber,
      projectName: projectName(c.projectId),
      amount: c.costImpact,
      requestedBy: c.requestedBy ?? "—",
      requestedDate: c.requestedDate,
    });
  }

  return items.sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());
}
