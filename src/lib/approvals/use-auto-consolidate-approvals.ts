"use client";

import * as React from "react";

import type { Budget } from "@/types/financial";
import type { Estimate } from "@/types/estimating";
import type { ChangeOrder } from "@/types/change-orders";
import type { PurchaseOrder, MaterialRequest } from "@/types/procurement";
import type { Project } from "@/types/project";
import type { ApprovalRequest } from "@/types/approvals";
import { computeRequiredApprovers } from "@/lib/approvals/approval-rules";
import { createApprovalRequest } from "@/lib/approvals/approval-request-store";

/**
 * Watches Budgets/Estimates/Change Orders/Purchase Orders/Material
 * Requests for anything sitting in a pending-approval-like status, and
 * auto-creates a tracking row in approval_requests for any that don't
 * have one yet — so nothing that needs sign-off can silently fall
 * outside the Approvals module.
 * Runs as a side effect on the Approvals page; safe to call repeatedly
 * since it only creates a row the first time a source is seen pending.
 */
export function useAutoConsolidateApprovals(
  budgets: Budget[],
  estimates: Estimate[],
  changeOrders: ChangeOrder[],
  purchaseOrders: PurchaseOrder[],
  projects: Project[],
  existingRequests: ApprovalRequest[],
  materialRequests: MaterialRequest[] = []
) {
  React.useEffect(() => {
    const existingSourceIds = new Set(existingRequests.map((r) => r.sourceId).filter(Boolean));
    const projectName = (id: string) => projects.find((p) => p.id === id)?.projectName ?? "—";

    for (const b of budgets) {
      if (b.budgetStatus !== "pending_approval" || existingSourceIds.has(b.id)) continue;
      createApprovalRequest({
        kind: "budget",
        sourceId: b.id,
        title: `Budget rev. ${b.revision}`,
        projectName: projectName(b.projectId),
        amount: b.currentBudget,
        requestedBy: b.preparedBy,
        requestedDate: b.createdDate.slice(0, 10),
        requiredApprovers: computeRequiredApprovers("budget", b.currentBudget),
      });
    }

    for (const e of estimates) {
      if (e.estimateStatus !== "owner_review" || existingSourceIds.has(e.id)) continue;
      createApprovalRequest({
        kind: "estimate",
        sourceId: e.id,
        title: e.estimateNumber,
        projectName: projectName(e.projectId),
        amount: e.totalEstimatedCost,
        requestedBy: e.estimator ?? "—",
        requestedDate: e.estimateDate,
        requiredApprovers: computeRequiredApprovers("estimate", e.totalEstimatedCost),
      });
    }

    for (const c of changeOrders) {
      if (c.changeOrderStatus !== "pending" || existingSourceIds.has(c.id)) continue;
      createApprovalRequest({
        kind: "change_order",
        sourceId: c.id,
        title: c.changeOrderNumber,
        projectName: projectName(c.projectId),
        amount: c.costImpact,
        requestedBy: c.requestedBy ?? "—",
        requestedDate: c.requestedDate,
        requiredApprovers: computeRequiredApprovers("change_order", c.costImpact),
      });
    }

    for (const po of purchaseOrders) {
      if (po.poStatus !== "pending_approval" || existingSourceIds.has(po.id)) continue;
      createApprovalRequest({
        kind: "purchase_order",
        sourceId: po.id,
        title: po.poNumber,
        projectName: projectName(po.projectId),
        amount: po.total,
        requestedBy: po.createdBy,
        requestedDate: po.orderDate,
        requiredApprovers: computeRequiredApprovers("purchase_order", po.total),
      });
    }
    for (const mr of materialRequests) {
      if (mr.requestStatus !== "for_approval" || existingSourceIds.has(mr.id)) continue;
      createApprovalRequest({
        kind: "material_request",
        sourceId: mr.id,
        title: mr.mrNumber,
        projectName: mr.projectId ? projectName(mr.projectId) : mr.propertyName ?? "—",
        amount: mr.estimatedCost ?? 0,
        requestedBy: mr.requestedBy,
        requestedDate: mr.requestDate,
        requiredApprovers: computeRequiredApprovers("material_request", mr.estimatedCost ?? 0),
      });
    }
    // Deliberately re-runs whenever the source lists change so newly
    // pending items get picked up; existingRequests guards against
    // creating duplicates.
  }, [budgets, estimates, changeOrders, purchaseOrders, projects, existingRequests, materialRequests]);
}
